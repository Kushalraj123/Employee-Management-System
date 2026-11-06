import JobOpening from '../models/JobOpening.js';
import Candidate from '../models/Candidate.js';
import { memoryStore, recordAuditLog } from '../store.js';
import mongoose from 'mongoose';

const KANBAN_STAGES = ['Applied', 'Screening', 'Interview', 'Selected', 'Offer', 'Hired', 'Rejected'];

/**
 * Explainable AI Resume Screening Engine
 * Extracts skills, compares against Job Description requirements, calculates explainable score,
 * and highlights matching vs. missing qualifications while keeping final decision under human control.
 */
export const evaluateResumeAgainstJob = (candidateData, jobOpening) => {
  const resumeText = (candidateData.resumeText || '').toLowerCase();
  const candidateSkills = (candidateData.skills || []).map(s => s.trim());
  const requiredSkills = jobOpening?.requiredSkills || ['System Design', 'React', 'Node.js', 'TypeScript'];

  const matchingSkills = [];
  const missingSkills = [];

  requiredSkills.forEach(reqSkill => {
    const reqLower = reqSkill.toLowerCase();
    const hasSkill =
      candidateSkills.some(cs => cs.toLowerCase().includes(reqLower) || reqLower.includes(cs.toLowerCase())) ||
      resumeText.includes(reqLower);

    if (hasSkill) {
      matchingSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Extract additional recognized tech/domain skills from resume text
  const knownCatalog = [
    'Kubernetes', 'Go', 'React', 'Node.js', 'TypeScript', 'Python', 'PyTorch', 'LLMs',
    'RAG', 'LangChain', 'Vector Databases', 'FastAPI', 'PostgreSQL', 'MongoDB', 'GraphQL',
    'Three.js', 'WebGL', 'GLSL Shaders', 'TailwindCSS', 'AWS', 'Docker', 'Kafka',
    'Enterprise SaaS', 'B2B Sales', 'Salesforce', 'Contract Negotiation', 'Key Account Strategy',
    'System Design', 'Financial Modeling', 'Talent Acquisition', 'SHRM'
  ];

  const extractedSkills = [...new Set([
    ...candidateSkills,
    ...knownCatalog.filter(k => resumeText.includes(k.toLowerCase()))
  ])];

  // Calculate explainable matching score (70% skill alignment + 20% experience alignment + 10% education/profile completeness)
  const skillRatio = requiredSkills.length > 0 ? matchingSkills.length / requiredSkills.length : 0.75;
  const expYears = Number(candidateData.experienceYears) || 3;
  const reqExpMatch = parseInt(jobOpening?.experienceRequired || '3', 10) || 3;
  const expRatio = Math.min(1, expYears / Math.max(1, reqExpMatch));

  const rawScore = Math.round(skillRatio * 72 + expRatio * 20 + (resumeText.length > 40 ? 8 : 4));
  const matchScore = Math.max(18, Math.min(99, rawScore));

  let recommendation = 'Human Review Required';
  if (matchScore >= 85) {
    recommendation = 'Strong Match — Recommended for Technical Interview (Human Approval Required)';
  } else if (matchScore >= 65) {
    recommendation = 'Moderate Match — Recommended for HR Screening Call (Human Approval Required)';
  } else {
    recommendation = 'Low Alignment — Review Skill Gaps Before Proceeding (Human Decision Required)';
  }

  const explanation =
    `Candidate matched ${matchingSkills.length} of ${requiredSkills.length} required job skills (${Math.round(skillRatio * 100)}% skill overlap) ` +
    `with ${expYears} yrs experience (target: ${jobOpening?.experienceRequired || '3+ Years'}). ` +
    (missingSkills.length > 0
      ? `Missing qualifications to probe during human interview: ${missingSkills.join(', ')}.`
      : `All primary technical qualifications verified in resume.`);

  return {
    extractedSkills,
    aiScreening: {
      matchScore,
      matchingSkills,
      missingSkills,
      explanation,
      recommendation,
      screenedAt: new Date().toISOString(),
    },
  };
};

// Get all job openings
export const getJobOpenings = async (req, res) => {
  try {
    const { department, status } = req.query;
    let list = [...memoryStore.jobOpenings];

    if (department && department !== 'All') {
      list = list.filter(j => j.department === department);
    }
    if (status && status !== 'All') {
      list = list.filter(j => j.status === status);
    }

    // Attach applicant counts per job
    const enriched = list.map(job => {
      const applicants = memoryStore.candidates.filter(c => c.jobId === (job._id || job.id));
      return {
        ...job,
        applicantCount: applicants.length,
        shortlistedCount: applicants.filter(c => ['Interview', 'Selected', 'Offer', 'Hired'].includes(c.stage)).length,
      };
    });

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create job opening
export const createJobOpening = async (req, res) => {
  try {
    const {
      title,
      department = 'Engineering',
      location = 'Bengaluru / Hybrid',
      employmentType = 'Full-Time',
      experienceRequired = '3-5 Years',
      salaryRange = '₹18L – ₹28L PA',
      description,
      requiredSkills = [],
      qualifications = [],
      openingsCount = 1,
      hiringManager,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Job title and job description are required.',
      });
    }

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : String(requiredSkills).split(',').map(s => s.trim()).filter(Boolean);

    const qualsArray = Array.isArray(qualifications)
      ? qualifications
      : String(qualifications).split(',').map(s => s.trim()).filter(Boolean);

    const newJob = {
      _id: 'job_' + Date.now(),
      id: 'job_' + Date.now(),
      jobCode: `NEX-JOB-${Math.floor(405 + Math.random() * 500)}`,
      title: title.trim(),
      department,
      location,
      employmentType,
      experienceRequired,
      salaryRange,
      description: description.trim(),
      requiredSkills: skillsArray.length ? skillsArray : ['Problem Solving', 'Domain Expertise'],
      qualifications: qualsArray.length ? qualsArray : ["Bachelor's Degree in relevant field"],
      openingsCount: Number(openingsCount) || 1,
      hiringManager: hiringManager || req.user?.name || 'Elena Rostova',
      status: 'Open',
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await JobOpening.create(newJob);
      } catch (e) {}
    }

    memoryStore.jobOpenings.unshift(newJob);

    recordAuditLog({
      action: 'JOB_OPENING_CREATED',
      user: req.user,
      targetType: 'Recruitment',
      targetId: newJob._id,
      details: `Published job opening "${newJob.title}" (${newJob.jobCode}) in ${newJob.department}`,
    });

    return res.status(201).json({
      success: true,
      message: `Job opening "${newJob.title}" published successfully.`,
      data: newJob,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update job status
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const job = memoryStore.jobOpenings.find(j => j._id === id || j.id === id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opening not found.' });
    }

    job.status = status || job.status;

    return res.status(200).json({
      success: true,
      message: `Job opening status updated to ${job.status}.`,
      data: job,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all candidates with filters
export const getCandidates = async (req, res) => {
  try {
    const { jobId, stage, department, search } = req.query;
    let list = [...memoryStore.candidates];

    if (jobId && jobId !== 'All') {
      list = list.filter(c => c.jobId === jobId);
    }
    if (stage && stage !== 'All') {
      list = list.filter(c => c.stage === stage);
    }
    if (department && department !== 'All') {
      list = list.filter(c => c.department === department);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q) ||
          (c.skills || []).some(s => s.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      stages: KANBAN_STAGES,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add applicant + automatic explainable AI resume screening
export const createCandidate = async (req, res) => {
  try {
    const {
      jobId,
      name,
      email,
      phone = '+91 98000 11223',
      experienceYears = 3,
      currentCompany = 'Tech Enterprise',
      education = 'B.Tech Computer Science',
      skills = [],
      resumeText = '',
      resumeFileName = 'Candidate_Resume.pdf',
      source = 'Direct Career Portal',
    } = req.body;

    if (!name || !email || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate name, email, and target job opening are required.',
      });
    }

    const job = memoryStore.jobOpenings.find(j => j._id === jobId || j.id === jobId) || memoryStore.jobOpenings[0];
    const parsedSkills = Array.isArray(skills)
      ? skills
      : String(skills).split(',').map(s => s.trim()).filter(Boolean);

    const screeningResult = evaluateResumeAgainstJob(
      { skills: parsedSkills, resumeText, experienceYears },
      job
    );

    const newCandidate = {
      _id: 'cand_' + Date.now(),
      id: 'cand_' + Date.now(),
      jobId: job ? (job._id || job.id) : jobId,
      jobTitle: job ? job.title : 'Software Engineer',
      department: job ? job.department : 'Engineering',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      experienceYears: Number(experienceYears) || 3,
      currentCompany,
      education,
      skills: screeningResult.extractedSkills.length ? screeningResult.extractedSkills : parsedSkills,
      resumeFileName,
      resumeText: resumeText || `${name} - ${experienceYears} years experience at ${currentCompany}. Skills: ${parsedSkills.join(', ')}.`,
      stage: 'Applied',
      aiScreening: screeningResult.aiScreening,
      interviews: [],
      source,
      avatar: `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(name.trim())}`,
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await Candidate.create(newCandidate);
      } catch (e) {}
    }

    memoryStore.candidates.unshift(newCandidate);

    // Notify HR & Hiring Manager
    memoryStore.notifications.unshift({
      _id: 'notif_' + Date.now(),
      userId: 'usr_hr',
      title: `New Applicant: ${newCandidate.name}`,
      message: `Applied for ${newCandidate.jobTitle} — AI Match Score: ${newCandidate.aiScreening.matchScore}%`,
      type: 'info',
      link: '/recruitment',
      read: false,
      createdAt: new Date().toISOString(),
    });

    recordAuditLog({
      action: 'CANDIDATE_ADDED',
      user: req.user,
      targetType: 'Recruitment',
      targetId: newCandidate._id,
      details: `Added applicant ${newCandidate.name} for ${newCandidate.jobTitle} (AI Match: ${newCandidate.aiScreening.matchScore}%)`,
    });

    return res.status(201).json({
      success: true,
      message: `Applicant ${newCandidate.name} added & screened by AI (Match Score: ${newCandidate.aiScreening.matchScore}%).`,
      data: newCandidate,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update candidate stage on Kanban board (Human-in-the-loop control)
export const updateCandidateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;

    if (!KANBAN_STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${KANBAN_STAGES.join(', ')}`,
      });
    }

    const candidate = memoryStore.candidates.find(c => c._id === id || c.id === id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const previousStage = candidate.stage;
    candidate.stage = stage;

    // If moved to Hired, optionally onboard as employee if not already in directory
    if (stage === 'Hired') {
      const alreadyEmp = memoryStore.employees.some(e => e.email.toLowerCase() === candidate.email.toLowerCase());
      if (!alreadyEmp) {
        const newEmpId = 'emp_' + Date.now();
        memoryStore.employees.unshift({
          _id: newEmpId,
          id: newEmpId,
          employeeId: `NEX-${Math.floor(1011 + Math.random() * 8900)}`,
          name: candidate.name,
          email: candidate.email,
          department: candidate.department || 'Engineering',
          designation: candidate.jobTitle,
          reportingManager: 'Elena Rostova',
          reportingManagerId: 'emp_001',
          roleLevel: 'Senior',
          gender: 'Prefer not to say',
          phone: candidate.phone || '+91 98000 00000',
          status: 'Active',
          joinDate: new Date().toISOString().split('T')[0],
          salary: 2000000,
          performanceScore: 90,
          avatar: candidate.avatar,
          bio: `Joined via NEXUS ATS Recruitment Pipeline (${candidate.source}). Former ${candidate.currentCompany}.`,
          skills: candidate.skills || ['Collaboration'],
          qualifications: [candidate.education || 'B.Tech'],
          documents: [{ id: 'doc_' + Date.now(), title: candidate.resumeFileName, category: 'Resume', fileSize: '950 KB', uploadedAt: new Date().toISOString().split('T')[0], status: 'Verified' }],
          activityHistory: [{ id: 'act_' + Date.now(), action: 'Hired & Onboarded via ATS', description: `Completed recruitment pipeline for ${candidate.jobTitle}`, timestamp: new Date().toISOString(), category: 'Onboarding' }],
        });
      }
    }

    recordAuditLog({
      action: 'CANDIDATE_STAGE_UPDATED',
      user: req.user,
      targetType: 'Recruitment',
      targetId: candidate._id,
      details: `Moved ${candidate.name} from "${previousStage}" → "${stage}"${notes ? ` (${notes})` : ''}`,
    });

    return res.status(200).json({
      success: true,
      message: `${candidate.name} moved to "${stage}" stage.`,
      data: candidate,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Schedule interview or add interviewer feedback
export const addInterviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      round = 'Technical Round',
      interviewer,
      scheduledAt,
      mode = 'Video Meet',
      status = 'Scheduled',
      rating = 4.5,
      feedback = '',
    } = req.body;

    const candidate = memoryStore.candidates.find(c => c._id === id || c.id === id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const interviewEntry = {
      id: 'int_' + Date.now(),
      round,
      interviewer: interviewer || req.user?.name || 'Elena Rostova',
      scheduledAt: scheduledAt || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      mode,
      status,
      rating: Number(rating) || 4.5,
      feedback: feedback.trim(),
    };

    if (!Array.isArray(candidate.interviews)) {
      candidate.interviews = [];
    }
    candidate.interviews.push(interviewEntry);

    if (candidate.stage === 'Applied' || candidate.stage === 'Screening') {
      candidate.stage = 'Interview';
    }

    return res.status(200).json({
      success: true,
      message: `Interview (${round}) recorded for ${candidate.name}.`,
      data: candidate,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Standalone AI Resume Screening endpoint (for live resume analyzer modal/tool)
export const screenResumeAI = async (req, res) => {
  try {
    const { jobId, resumeText, candidateName = 'Candidate', experienceYears = 3, skills = [] } = req.body;

    if (!resumeText || resumeText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resume text or candidate summary to analyze.',
      });
    }

    const job = memoryStore.jobOpenings.find(j => j._id === jobId || j.id === jobId) || memoryStore.jobOpenings[0];
    const result = evaluateResumeAgainstJob(
      { resumeText, skills, experienceYears },
      job
    );

    return res.status(200).json({
      success: true,
      candidateName,
      jobTitle: job?.title || 'Enterprise Role',
      jobCode: job?.jobCode || 'NEX-JOB-401',
      requiredSkills: job?.requiredSkills || [],
      extractedSkills: result.extractedSkills,
      aiScreening: result.aiScreening,
      humanControlNotice: 'AI screening provides explainable decision support only. Final shortlisting and hiring decisions remain strictly under human HR/Manager authority.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Recruitment Analytics
export const getRecruitmentAnalytics = async (req, res) => {
  try {
    const candidates = memoryStore.candidates;
    const jobs = memoryStore.jobOpenings;

    const stageDistribution = KANBAN_STAGES.map(stage => ({
      stage,
      count: candidates.filter(c => c.stage === stage).length,
    }));

    const sourceCounts = {};
    candidates.forEach(c => {
      sourceCounts[c.source || 'LinkedIn'] = (sourceCounts[c.source || 'LinkedIn'] || 0) + 1;
    });

    const sourceBreakdown = Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
    }));

    const avgMatchScore = candidates.length
      ? Math.round(candidates.reduce((acc, c) => acc + (c.aiScreening?.matchScore || 75), 0) / candidates.length)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalOpenJobs: jobs.filter(j => j.status === 'Open').length,
        totalOpenPositions: jobs.filter(j => j.status === 'Open').reduce((s, j) => s + (j.openingsCount || 1), 0),
        totalCandidates: candidates.length,
        avgMatchScore,
        hiredCount: candidates.filter(c => c.stage === 'Hired').length,
        offerCount: candidates.filter(c => c.stage === 'Offer').length,
        interviewCount: candidates.filter(c => c.stage === 'Interview').length,
        avgTimeToHireDays: 18,
        stageDistribution,
        sourceBreakdown,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

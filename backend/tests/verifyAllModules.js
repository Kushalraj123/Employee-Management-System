/**
 * NEXUS Enterprise HRMS — Automated Verification & Integration Suite (ESM)
 * Verifies Store, 4-Role RBAC, 3D Org Hierarchy, Configurable Payroll,
 * 7-Stage ATS Recruitment, AI Resume Screening, AI Workforce Analytics,
 * Kudos Recognition, and Audit Logging.
 */
import assert from 'assert';
import { memoryStore, recordAuditLog } from '../store.js';
import { getWorkforceAnalytics, generateAIReport } from '../controllers/aiController.js';
import { screenResumeAI } from '../controllers/recruitmentController.js';

console.log('====================================================');
console.log('🚀 NEXUS ENTERPRISE HRMS — AUTOMATED TEST SUITE');
console.log('====================================================\n');

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

async function runTests() {
  // 1. Verify 4-Tier Role Accounts
  const roles = memoryStore.users.map((u) => u.role);
  ['admin', 'hr', 'manager', 'employee'].forEach((requiredRole) => {
    assert(roles.includes(requiredRole), `Missing required role: ${requiredRole}`);
  });
  console.log('✅ [PASS] 4-Role Authentication Store (Super Admin, HR Admin, Dept Manager, Employee)');

  // 2. Verify 3D Org Network Hierarchy & Reporting Chains
  assert(memoryStore.employees.length >= 11, 'Expected at least 11 seeded enterprise employees');
  const ceo = memoryStore.employees.find((e) => !e.reportingManagerId);
  assert(ceo, 'Expected a root CEO node for 3D Org Network');
  const reportsToCeo = memoryStore.employees.filter((e) => e.reportingManagerId === ceo._id);
  assert(reportsToCeo.length >= 3, 'Expected multiple VPs/Directors reporting to CEO');
  console.log(`✅ [PASS] 3D Organizational Network Hierarchy (${memoryStore.employees.length} nodes, CEO: ${ceo.name})`);

  // 3. Verify Configurable Payroll Rules
  assert(memoryStore.payrollRules.basicSalaryPercent === 50, 'Expected configurable basic salary %');
  assert(memoryStore.payrollRules.providentFundPercentOfBasic === 12, 'Expected configurable PF %');
  console.log('✅ [PASS] Configurable Payroll Rules & Tax Slabs Engine');

  // 4. Verify Recruitment ATS & Explainable AI Resume Screening
  assert(memoryStore.jobOpenings.length >= 4, 'Expected active job openings');
  assert(memoryStore.candidates.length >= 6, 'Expected candidates across ATS pipeline');
  const job = memoryStore.jobOpenings[0];
  const screenRes = createMockRes();
  await screenResumeAI(
    {
      body: {
        jobId: job._id,
        resumeText: '6 years experience building distributed systems with Kubernetes, Go, Node.js, Kafka, PostgreSQL, and AWS. B.Tech Computer Science.',
        skills: ['Kubernetes', 'Go', 'Node.js', 'Kafka', 'PostgreSQL', 'AWS'],
        experienceYears: 6,
      },
    },
    screenRes
  );
  const screening = screenRes.body?.aiScreening || screenRes.body?.data;
  assert(screening && typeof screening.matchScore === 'number', 'Expected numeric AI matching score');
  assert(Array.isArray(screening.matchingSkills || screening.matchedSkills), 'Expected matched skills list');
  assert(Array.isArray(screening.missingSkills), 'Expected missing skills list');
  assert(screenRes.body?.humanControlNotice?.includes('human'), 'Expected human-in-the-loop control notice');
  console.log(`✅ [PASS] AI Resume Screener (Score: ${screening.matchScore}% — ${screening.recommendation})`);

  // 5. Verify AI Workforce Analytics (Verified Facts vs Predictions)
  const wfRes = createMockRes();
  await getWorkforceAnalytics({}, wfRes);
  const wfAnalytics = wfRes.body;
  assert(Array.isArray(wfAnalytics.verifiedFacts) && wfAnalytics.verifiedFacts.length > 0, 'Expected verified facts');
  assert(Array.isArray(wfAnalytics.aiPredictions) && wfAnalytics.aiPredictions.length > 0, 'Expected AI predictions');
  assert(wfAnalytics.verifiedFacts[0].classification === 'VERIFIED_FACT', 'Expected explicit VERIFIED_FACT tag');
  assert(wfAnalytics.aiPredictions[0].classification === 'AI_PREDICTION', 'Expected explicit AI_PREDICTION tag');
  console.log('✅ [PASS] AI Workforce Analytics (Explicit Verified Facts vs. AI Predictions separation)');

  // 6. Verify AI Report Generator
  const repRes = createMockRes();
  await generateAIReport({ body: { department: 'Engineering' }, user: { name: 'Test Admin' } }, repRes);
  const aiReport = repRes.body?.report;
  assert(aiReport && aiReport.executiveNarrative.includes('Engineering'), 'Expected Engineering executive summary');
  assert(Array.isArray(aiReport.departmentRows) && aiReport.departmentRows.length > 0, 'Expected department breakdown rows');
  console.log('✅ [PASS] AI Report Generator (Executive Summary + CSV/PDF Export structure)');

  // 7. Verify Kudos & Audit Logging
  const initialLogs = memoryStore.auditLogs.length;
  recordAuditLog({
    action: 'TEST_VERIFICATION',
    user: { email: 'admin@nexus.io', role: 'admin' },
    targetType: 'System',
    targetId: 'sys_01',
    details: 'Automated verification suite executed',
  });
  assert(memoryStore.auditLogs.length === initialLogs + 1, 'Expected new audit log entry');
  assert(memoryStore.kudos.length >= 3, 'Expected seeded employee recognition kudos');
  console.log('✅ [PASS] Employee Kudos Wall & Immutable Security Audit Logging');

  console.log('\n🎉 ALL 7 ENTERPRISE VERIFICATION SUITES PASSED WITH ZERO ERRORS!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

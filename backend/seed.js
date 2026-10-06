import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus_hr';

const SEED_EMPLOYEES = [
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@nexus.io',
    department: 'Engineering',
    designation: 'Principal Architect & VP Tech',
    gender: 'Female',
    phone: '+91 98201 23456',
    status: 'Active',
    joinDate: new Date('2022-03-15'),
    salary: 2850000,
    performanceScore: 98,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Leads distributed systems engineering and AI integration for core enterprise platforms.',
    skills: ['Kubernetes', 'Go', 'React', 'Cloud Architecture', 'System Design'],
  },
  {
    name: 'Marcus Vance',
    email: 'marcus.vance@nexus.io',
    department: 'Engineering',
    designation: 'Senior Full-Stack Engineer',
    gender: 'Male',
    phone: '+91 98450 34567',
    status: 'Active',
    joinDate: new Date('2023-01-10'),
    salary: 2100000,
    performanceScore: 94,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'Specialist in high-throughput React frontends and Node.js microservices.',
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL', 'Next.js'],
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@nexus.io',
    department: 'HR',
    designation: 'Chief People Officer',
    gender: 'Female',
    phone: '+91 98100 45678',
    status: 'Active',
    joinDate: new Date('2021-08-01'),
    salary: 2400000,
    performanceScore: 96,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Directs global talent acquisition, workplace culture, and leadership development programs.',
    skills: ['Talent Strategy', 'People Analytics', 'Compensation', 'Culture Building'],
  },
  {
    name: 'Devon Wright',
    email: 'devon.wright@nexus.io',
    department: 'Sales',
    designation: 'VP Enterprise Sales',
    gender: 'Male',
    phone: '+91 99887 56789',
    status: 'Active',
    joinDate: new Date('2022-11-20'),
    salary: 2500000,
    performanceScore: 91,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Drives global enterprise revenue growth and strategic customer partnerships.',
    skills: ['Enterprise SaaS', 'Key Account Strategy', 'Pipeline Mgmt', 'Negotiation'],
  },
  {
    name: 'Amina Al-Mansoor',
    email: 'amina.mansoor@nexus.io',
    department: 'Finance',
    designation: 'Director of Strategic Finance',
    gender: 'Female',
    phone: '+91 97654 67890',
    status: 'Active',
    joinDate: new Date('2022-05-14'),
    salary: 2250000,
    performanceScore: 95,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Oversees financial planning, operational budgeting, and corporate fiscal governance.',
    skills: ['Financial Modeling', 'Forecasting', 'Cap Table Management', 'Tax Strategy'],
  },
  {
    name: 'Lucas Dupont',
    email: 'lucas.dupont@nexus.io',
    department: 'Engineering',
    designation: 'Frontend 3D/WebGL Developer',
    gender: 'Male',
    phone: '+91 98312 90123',
    status: 'Active',
    joinDate: new Date('2024-02-15'),
    salary: 1750000,
    performanceScore: 97,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Creates interactive 3D web applications, animations, and high-performance visual tools.',
    skills: ['Three.js', 'WebGL', 'GLSL Shaders', 'React Three Fiber', 'TailwindCSS'],
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');
    await Employee.deleteMany();
    console.log('Cleared existing employee collection...');
    await Employee.insertMany(SEED_EMPLOYEES);
    console.log(`✅ Successfully seeded ${SEED_EMPLOYEES.length} employees into MongoDB!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Videos de muestra confiables y de dominio público
// Múltiples fuentes para redundancia
const SAMPLE_VIDEOS = {
    // Videos cortos de Google (muy confiables)
    bigBuckBunny: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    elephantsDream: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    forBiggerBlazes: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    forBiggerEscapes: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    forBiggerFun: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    forBiggerJoyrides: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    forBiggerMeltdowns: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    sintel: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    subaru: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    tearsOfSteel: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    volkswagenGTI: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    weAreGoingOnBullrun: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    whatCarCanYouGetForAGrand: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
}

// Función para obtener video rotativo
const videoList = Object.values(SAMPLE_VIDEOS)
function getVideoUrl(index: number): string {
    return videoList[index % videoList.length]
}

async function main() {
    console.log('🌱 Starting seed...')

    // Clear existing data to allow re-seeding
    console.log('🧹 Cleaning existing data...')
    await prisma.lessonProgress.deleteMany({})
    await prisma.achievement.deleteMany({})
    await prisma.enrollment.deleteMany({})
    await prisma.lesson.deleteMany({})
    await prisma.module.deleteMany({})
    await prisma.course.deleteMany({})
    // Delete demo users to recreate with correct passwords
    await prisma.user.deleteMany({
        where: {
            email: {
                in: ['instructor@learnflow.ai', 'student@learnflow.ai']
            }
        }
    })
    console.log('✅ Database cleaned')

    // Create demo instructor user
    const instructor = await prisma.user.create({
        data: {
            email: 'instructor@learnflow.ai',
            password: '$2b$10$LiLPE8JgvN./9SerqXv1nuSmLJ4gzqz71r2k4LFC1u12A5M.AZMuC', // password: instructor123
            name: 'Dr. Sarah Johnson',
            role: 'instructor',
            xp: 5000,
            level: 10,
            streak: 30
        }
    })

    console.log('👨‍🏫 Instructor:', instructor.name)

    // Create demo student user for testing
    const student = await prisma.user.create({
        data: {
            email: 'student@learnflow.ai',
            password: '$2b$10$SefAlmsfttPpV23O73tGeuifB/xa1Q5nAsFfRFB/cnyhBJF32EQje', // password: student123
            name: 'Carlos Méndez',
            role: 'student',
            xp: 150,
            level: 2,
            streak: 5
        }
    })

    console.log('👨‍🎓 Student:', student.name)

    // Course 1: Full Stack Web Development Bootcamp
    const course1 = await prisma.course.create({
        data: {
            title: 'Full Stack Web Development Bootcamp 2024',
            subtitle: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB',
            description: 'Become a full-stack web developer with just ONE course. HTML, CSS, Javascript, Node, React, MongoDB, and more! This comprehensive bootcamp will take you from zero to hero in web development.',
            slug: 'full-stack-web-development-bootcamp-2024',
            category: 'Web Development',
            level: 'Beginner',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
            price: 89.99,
            isFree: false,
            status: 'published',
            publishedAt: new Date(),
            instructorId: instructor.id,
            modules: {
                create: [
                    {
                        title: 'Frontend Fundamentals',
                        description: 'Master the core technologies of web development',
                        orderIndex: 0,
                        lessons: {
                            create: [
                                {
                                    title: 'Introduction to HTML5',
                                    description: 'Learn the building blocks of the web with modern HTML5',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(0),
                                    videoDuration: 1200,
                                    isPreview: true
                                },
                                {
                                    title: 'CSS3 Styling & Flexbox',
                                    description: 'Create beautiful layouts with modern CSS',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(1),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'JavaScript ES6+ Essentials',
                                    description: 'Modern JavaScript features and best practices',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(2),
                                    videoDuration: 2400
                                },
                                {
                                    title: 'Responsive Design with CSS Grid',
                                    description: 'Build responsive layouts that work on any device',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(3),
                                    videoDuration: 1500
                                },
                                {
                                    title: 'DOM Manipulation & Events',
                                    description: 'Make your websites interactive with JavaScript',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(4),
                                    videoDuration: 2100
                                }
                            ]
                        }
                    },
                    {
                        title: 'React & Modern Frontend',
                        description: 'Build dynamic user interfaces with React',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'React Fundamentals & JSX',
                                    description: 'Get started with React and component-based architecture',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(5),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'State Management with Hooks',
                                    description: 'Master useState, useEffect, and custom hooks',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(6),
                                    videoDuration: 2200
                                },
                                {
                                    title: 'React Router & Navigation',
                                    description: 'Build single-page applications with routing',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(7),
                                    videoDuration: 1600
                                },
                                {
                                    title: 'API Integration & Fetch',
                                    description: 'Connect your React app to backend APIs',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(8),
                                    videoDuration: 1900
                                },
                                {
                                    title: 'Building a Complete React Project',
                                    description: 'Put it all together in a real-world application',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(9),
                                    videoDuration: 3600
                                }
                            ]
                        }
                    },
                    {
                        title: 'Backend Development with Node.js',
                        description: 'Create powerful server-side applications',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Node.js & Express Setup',
                                    description: 'Build your first Node.js server',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(10),
                                    videoDuration: 1400
                                },
                                {
                                    title: 'RESTful API Design',
                                    description: 'Create professional REST APIs',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(11),
                                    videoDuration: 2000
                                },
                                {
                                    title: 'MongoDB & Database Integration',
                                    description: 'Store and retrieve data with MongoDB',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(12),
                                    videoDuration: 2400
                                },
                                {
                                    title: 'Authentication & Security',
                                    description: 'Implement JWT authentication and security best practices',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(0),
                                    videoDuration: 2800
                                },
                                {
                                    title: 'Deployment to Production',
                                    description: 'Deploy your full-stack app to the cloud',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(1),
                                    videoDuration: 2200
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    // Course 2: Data Science & Machine Learning
    const course2 = await prisma.course.create({
        data: {
            title: 'Data Science & Machine Learning Masterclass',
            subtitle: 'Python, Statistics, Machine Learning, Deep Learning & AI',
            description: 'Learn Data Science from scratch! Master Python, NumPy, Pandas, Matplotlib, Scikit-Learn, Machine Learning, and Deep Learning. This is the most comprehensive data science course available.',
            slug: 'data-science-machine-learning-masterclass',
            category: 'Data Science',
            level: 'Intermediate',
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
            price: 99.99,
            isFree: false,
            status: 'published',
            publishedAt: new Date(),
            instructorId: instructor.id,
            modules: {
                create: [
                    {
                        title: 'Python for Data Science',
                        description: 'Master Python programming for data analysis',
                        orderIndex: 0,
                        lessons: {
                            create: [
                                {
                                    title: 'Python Fundamentals Review',
                                    description: 'Quick review of Python essentials',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(0),
                                    videoDuration: 1500,
                                    isPreview: true
                                },
                                {
                                    title: 'NumPy for Numerical Computing',
                                    description: 'Work with arrays and matrices efficiently',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(1),
                                    videoDuration: 2100
                                },
                                {
                                    title: 'Pandas for Data Manipulation',
                                    description: 'Clean, transform, and analyze data with Pandas',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(2),
                                    videoDuration: 2800
                                },
                                {
                                    title: 'Data Visualization with Matplotlib',
                                    description: 'Create stunning visualizations',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(3),
                                    videoDuration: 1900
                                },
                                {
                                    title: 'Advanced Visualization with Seaborn',
                                    description: 'Statistical data visualization made easy',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(4),
                                    videoDuration: 1600
                                }
                            ]
                        }
                    },
                    {
                        title: 'Machine Learning Fundamentals',
                        description: 'Build predictive models with Scikit-Learn',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'Introduction to Machine Learning',
                                    description: 'Understand ML concepts and workflows',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(5),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'Linear & Logistic Regression',
                                    description: 'Build your first predictive models',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(6),
                                    videoDuration: 2400
                                },
                                {
                                    title: 'Decision Trees & Random Forests',
                                    description: 'Ensemble learning techniques',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(7),
                                    videoDuration: 2200
                                },
                                {
                                    title: 'Support Vector Machines',
                                    description: 'Advanced classification algorithms',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(8),
                                    videoDuration: 2000
                                },
                                {
                                    title: 'Model Evaluation & Optimization',
                                    description: 'Fine-tune your models for best performance',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(9),
                                    videoDuration: 2600
                                }
                            ]
                        }
                    },
                    {
                        title: 'Deep Learning & Neural Networks',
                        description: 'Build AI models with TensorFlow and Keras',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Neural Networks Basics',
                                    description: 'Understand how neural networks work',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(10),
                                    videoDuration: 2200
                                },
                                {
                                    title: 'Building CNNs for Image Recognition',
                                    description: 'Convolutional Neural Networks explained',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(11),
                                    videoDuration: 2800
                                },
                                {
                                    title: 'RNNs for Sequence Data',
                                    description: 'Recurrent Neural Networks and LSTM',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(12),
                                    videoDuration: 2600
                                },
                                {
                                    title: 'Transfer Learning & Pre-trained Models',
                                    description: 'Leverage existing models for your projects',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(0),
                                    videoDuration: 2400
                                },
                                {
                                    title: 'Capstone: Real-World ML Project',
                                    description: 'Build an end-to-end machine learning solution',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(1),
                                    videoDuration: 4200
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    // Course 3: Digital Marketing Mastery
    const course3 = await prisma.course.create({
        data: {
            title: 'Digital Marketing Mastery 2024',
            subtitle: 'SEO, Social Media, Email Marketing, PPC & Analytics',
            description: 'Master digital marketing with this complete course. Learn SEO, social media marketing, email campaigns, Google Ads, Facebook Ads, and analytics. Grow your business or start a marketing career.',
            slug: 'digital-marketing-mastery-2024',
            category: 'Marketing',
            level: 'Beginner',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            price: 79.99,
            isFree: false,
            status: 'published',
            publishedAt: new Date(),
            instructorId: instructor.id,
            modules: {
                create: [
                    {
                        title: 'SEO & Content Marketing',
                        description: 'Rank higher on Google and drive organic traffic',
                        orderIndex: 0,
                        lessons: {
                            create: [
                                {
                                    title: 'SEO Fundamentals',
                                    description: 'How search engines work and ranking factors',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(2),
                                    videoDuration: 1600,
                                    isPreview: true
                                },
                                {
                                    title: 'Keyword Research Strategies',
                                    description: 'Find profitable keywords for your business',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(3),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'On-Page SEO Optimization',
                                    description: 'Optimize your website for search engines',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(4),
                                    videoDuration: 2000
                                },
                                {
                                    title: 'Link Building & Off-Page SEO',
                                    description: 'Build authority and backlinks',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(5),
                                    videoDuration: 1900
                                },
                                {
                                    title: 'Content Marketing Strategy',
                                    description: 'Create content that converts',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(6),
                                    videoDuration: 2200
                                }
                            ]
                        }
                    },
                    {
                        title: 'Social Media Marketing',
                        description: 'Build your brand on social platforms',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'Social Media Strategy',
                                    description: 'Choose the right platforms and create a plan',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(7),
                                    videoDuration: 1500
                                },
                                {
                                    title: 'Facebook & Instagram Marketing',
                                    description: 'Grow your audience on Meta platforms',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(8),
                                    videoDuration: 2100
                                },
                                {
                                    title: 'LinkedIn for B2B Marketing',
                                    description: 'Professional networking and lead generation',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(9),
                                    videoDuration: 1700
                                },
                                {
                                    title: 'TikTok & Short-Form Video',
                                    description: 'Viral marketing with video content',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(10),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'Social Media Analytics',
                                    description: 'Measure and optimize your campaigns',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(11),
                                    videoDuration: 1600
                                }
                            ]
                        }
                    },
                    {
                        title: 'Paid Advertising & Analytics',
                        description: 'Master Google Ads, Facebook Ads, and data analysis',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Google Ads Fundamentals',
                                    description: 'Create profitable search campaigns',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(12),
                                    videoDuration: 2200
                                },
                                {
                                    title: 'Facebook Ads Mastery',
                                    description: 'Target and convert your ideal customers',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(0),
                                    videoDuration: 2400
                                },
                                {
                                    title: 'Email Marketing Automation',
                                    description: 'Build email funnels that convert',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(1),
                                    videoDuration: 1900
                                },
                                {
                                    title: 'Google Analytics 4',
                                    description: 'Track and analyze your marketing performance',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(2),
                                    videoDuration: 2100
                                },
                                {
                                    title: 'Marketing ROI & Attribution',
                                    description: 'Measure what matters and optimize spend',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(3),
                                    videoDuration: 2000
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    // Course 4: UI/UX Design Professional Certificate
    const course4 = await prisma.course.create({
        data: {
            title: 'UI/UX Design Professional Certificate',
            subtitle: 'Figma, User Research, Wireframing, Prototyping & Design Systems',
            description: 'Become a professional UI/UX designer. Learn user research, wireframing, prototyping, and visual design. Master Figma and build a portfolio of real projects.',
            slug: 'ui-ux-design-professional-certificate',
            category: 'Design',
            level: 'Beginner',
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
            price: 84.99,
            isFree: false,
            status: 'published',
            publishedAt: new Date(),
            instructorId: instructor.id,
            modules: {
                create: [
                    {
                        title: 'UX Research & Strategy',
                        description: 'Understand users and design with empathy',
                        orderIndex: 0,
                        lessons: {
                            create: [
                                {
                                    title: 'Introduction to UX Design',
                                    description: 'What is UX and why it matters',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(4),
                                    videoDuration: 1400,
                                    isPreview: true
                                },
                                {
                                    title: 'User Research Methods',
                                    description: 'Interviews, surveys, and usability testing',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(5),
                                    videoDuration: 2000
                                },
                                {
                                    title: 'Creating User Personas',
                                    description: 'Define your target users',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(6),
                                    videoDuration: 1600
                                },
                                {
                                    title: 'User Journey Mapping',
                                    description: 'Visualize the user experience',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(7),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'Information Architecture',
                                    description: 'Structure content for optimal usability',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(8),
                                    videoDuration: 1700
                                }
                            ]
                        }
                    },
                    {
                        title: 'UI Design & Figma Mastery',
                        description: 'Create beautiful interfaces with Figma',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'Figma Fundamentals',
                                    description: 'Master the industry-standard design tool',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(9),
                                    videoDuration: 1900
                                },
                                {
                                    title: 'Typography & Color Theory',
                                    description: 'Design principles for visual hierarchy',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(10),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'Layout & Grid Systems',
                                    description: 'Create balanced, professional layouts',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(11),
                                    videoDuration: 1600
                                },
                                {
                                    title: 'Component Design & Variants',
                                    description: 'Build reusable design components',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(12),
                                    videoDuration: 2100
                                },
                                {
                                    title: 'Responsive Design Principles',
                                    description: 'Design for all screen sizes',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(0),
                                    videoDuration: 2000
                                }
                            ]
                        }
                    },
                    {
                        title: 'Prototyping & Design Systems',
                        description: 'Bring your designs to life',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Wireframing Best Practices',
                                    description: 'Sketch ideas quickly and effectively',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(1),
                                    videoDuration: 1500
                                },
                                {
                                    title: 'Interactive Prototyping in Figma',
                                    description: 'Create clickable prototypes',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(2),
                                    videoDuration: 2200
                                },
                                {
                                    title: 'Micro-interactions & Animations',
                                    description: 'Add delight to your designs',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(3),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'Building a Design System',
                                    description: 'Create scalable design foundations',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(4),
                                    videoDuration: 2400
                                },
                                {
                                    title: 'Portfolio Project: Mobile App Design',
                                    description: 'Design a complete mobile application',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(5),
                                    videoDuration: 3600
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    // Course 5: Business Finance & Financial Analysis
    const course5 = await prisma.course.create({
        data: {
            title: 'Business Finance & Financial Analysis',
            subtitle: 'Financial Modeling, Excel, Accounting & Investment Analysis',
            description: 'Master business finance and financial analysis. Learn financial modeling, Excel for finance, accounting fundamentals, and investment analysis. Perfect for aspiring analysts and business professionals.',
            slug: 'business-finance-financial-analysis',
            category: 'Business',
            level: 'Intermediate',
            thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
            price: 94.99,
            isFree: false,
            status: 'published',
            publishedAt: new Date(),
            instructorId: instructor.id,
            modules: {
                create: [
                    {
                        title: 'Financial Accounting Fundamentals',
                        description: 'Understand financial statements and accounting principles',
                        orderIndex: 0,
                        lessons: {
                            create: [
                                {
                                    title: 'Introduction to Financial Accounting',
                                    description: 'The language of business',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(6),
                                    videoDuration: 1500,
                                    isPreview: true
                                },
                                {
                                    title: 'The Balance Sheet',
                                    description: 'Assets, liabilities, and equity explained',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(7),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'Income Statement Analysis',
                                    description: 'Revenue, expenses, and profitability',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(8),
                                    videoDuration: 1700
                                },
                                {
                                    title: 'Cash Flow Statement',
                                    description: 'Understanding cash movements',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(9),
                                    videoDuration: 1900
                                },
                                {
                                    title: 'Financial Ratios & Metrics',
                                    description: 'Analyze company performance',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(10),
                                    videoDuration: 2100
                                }
                            ]
                        }
                    },
                    {
                        title: 'Excel for Financial Modeling',
                        description: 'Build professional financial models',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                {
                                    title: 'Excel Fundamentals for Finance',
                                    description: 'Essential formulas and functions',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(11),
                                    videoDuration: 1600
                                },
                                {
                                    title: 'Financial Modeling Best Practices',
                                    description: 'Structure and design principles',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(12),
                                    videoDuration: 2000
                                },
                                {
                                    title: 'Building a 3-Statement Model',
                                    description: 'Integrate income statement, balance sheet, and cash flow',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(0),
                                    videoDuration: 2800
                                },
                                {
                                    title: 'DCF Valuation Models',
                                    description: 'Discounted cash flow analysis',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(1),
                                    videoDuration: 2400
                                },
                                {
                                    title: 'Scenario & Sensitivity Analysis',
                                    description: 'Model different business scenarios',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(2),
                                    videoDuration: 2200
                                }
                            ]
                        }
                    },
                    {
                        title: 'Investment Analysis & Valuation',
                        description: 'Evaluate investment opportunities',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                {
                                    title: 'Time Value of Money',
                                    description: 'NPV, IRR, and present value calculations',
                                    orderIndex: 0,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(3),
                                    videoDuration: 1800
                                },
                                {
                                    title: 'Company Valuation Methods',
                                    description: 'Comparable company analysis and precedent transactions',
                                    orderIndex: 1,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(4),
                                    videoDuration: 2200
                                },
                                {
                                    title: 'Stock Market Analysis',
                                    description: 'Fundamental and technical analysis basics',
                                    orderIndex: 2,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(5),
                                    videoDuration: 2000
                                },
                                {
                                    title: 'Risk & Return Analysis',
                                    description: 'Portfolio theory and risk management',
                                    orderIndex: 3,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(6),
                                    videoDuration: 2100
                                },
                                {
                                    title: 'Capstone: Investment Pitch Project',
                                    description: 'Analyze and present an investment opportunity',
                                    orderIndex: 4,
                                    lessonType: 'video',
                                    videoUrl: getVideoUrl(7),
                                    videoDuration: 3000
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    console.log('✅ Created 5 professional courses:')
    console.log('  1.', course1.title)
    console.log('  2.', course2.title)
    console.log('  3.', course3.title)
    console.log('  4.', course4.title)
    console.log('  5.', course5.title)

    console.log('\n📊 Summary:')
    console.log('  - 5 courses created')
    console.log('  - 15 modules total (3 per course)')
    console.log('  - 75 lessons total (5 per module)')
    console.log('  - All courses published and ready')
    console.log('\n🌱 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

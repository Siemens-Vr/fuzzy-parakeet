import { PrismaClient } from '@prisma/generated/client';

const prisma = new PrismaClient();

const articles = [
    {
        slug: 'pioneering-industry-4-0-vml-dekut',
        title: 'Pioneering Industry 4.0: Inside DeKUT\'s Virtual Mechatronics Labs',
        excerpt: 'How Dedan Kimathi University is bridging the gap between academia and industry with state-of-the-art virtual labs.',
        content: `
# Virtual Mechatronics Labs: Africa's Gateway to Industry 4.0

Dedan Kimathi University of Technology (DeKUT) has established the **Virtual Mechatronics Labs (VML)**, a pioneering innovation hub designed to revolutionize engineering education and industrial training across Africa.

## Bridging the Skills Gap
The VML was born out of a critical need identified during the 2021–2024 WorldSkills Competitions: a widening gap between traditional academic training and the rapidly evolving demands of modern industry. By leveraging **Virtual Reality (VR)**, **Augmented Reality (AR)**, and **Digital Twins**, VML provides students with immersive, hands-on experience that was previously impossible without expensive physical machinery.

## Key Technologies
VML integrates cutting-edge technologies to create realistic simulations:
- **Virtual Reality (VR):** Fully immersive environments where students can operate virtual machines, from PLCs to robotic arms.
- **Digital Twins:** Real-time virtual replicas of physical systems that allow for safe experimentation and optimization.
- **Artificial Intelligence (AI):** Intelligent systems that adapt to student learning paces and provide real-time feedback.

## The VMC Lab Experience
One of the flagship initiatives is the **Virtual Machine Control (VMC) Lab**. Here, users can interact with virtual workbenches, troubleshoot pneumatic systems, and commission complex automation workflows—all without the risk of damaging equipment or injury.

> "VML is not just about technology; it's about empowering the next generation of African engineers with the skills they need to lead the Fourth Industrial Revolution."

With support from global partners like UNIDO, DeKUT is setting a new standard for technical education, ensuring that graduates are not just job-seekers, but industry-ready innovators.
    `,
        coverImageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
        category: 'Industry 4.0',
        tags: JSON.stringify(['VML', 'DeKUT', 'Mechatronics', 'VR', 'Education']),
        authorName: 'Tech Insider',
        authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
        readTime: '5 min',
        featured: true,
    },
    {
        slug: 'revolutionizing-prosthetics-digital-twins',
        title: 'Revolutionizing Prosthetics with AI & Digital Twins',
        excerpt: 'How VML is using mobile photogrammetry and AI to create affordable, custom-fit prosthetics.',
        content: `
# A New Hope for Amputees: High-Tech Prosthetics at DeKUT

In a groundbreaking collaboration with Carnegie Mellon University in Rwanda and the University of Nairobi, DeKUT's Virtual Mechatronics Labs is tackling a vital human challenge: access to affordable, comfortable prosthetics.

## The Challenge
Traditional prosthetic manufacturing is expensive, time-consuming, and often results in uncomfortable fits. For many in Africa, high-quality prosthetics remain out of reach.

## The Solution: AI & Photogrammetry
The **Prosthetics Project** at VML is changing the game by using accessible technology:
1.  **Mobile Scanning:** Patients can simply take photos of their stump using a standard mobile phone.
2.  **AI Reconstruction:** Artificial Intelligence algorithms analyze these photos to generate a precise 3D model of the limb.
3.  **Digital Twin Simulation:** Before any physical manufacturing happens, a "Digital Twin" of the prosthetic socket is created and tested in a virtual environment to ensure optimal fit and comfort.
4.  **3D Printing:** The final design is manufactured using advanced 3D printing techniques, significantly reducing costs and lead times.

## Impact
This innovation not only lowers the barrier to entry for essential medical devices but also improves the quality of life for users. By combining **mechatronics**, **AI**, and **medicine**, DeKUT is demonstrating the profound social impact of Industry 4.0 technologies.

Project Director **Prof. Eng. Jean Bosco Byiringiro** emphasizes that this is just the beginning of how virtual simulations can solve tangible, real-world problems.
    `,
        coverImageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1200',
        category: 'Healthcare',
        tags: JSON.stringify(['Prosthetics', 'AI', 'Digital Twins', 'Healthcare', 'Innovation']),
        authorName: 'Health Tech',
        authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Health',
        readTime: '4 min',
        featured: false,
    },
    {
        slug: 'ai-at-the-edge-dekut-dsail',
        title: 'Artificial Intelligence at the Edge: DeKUT\'s DSAIL Projects',
        excerpt: 'From conservation to agriculture, how DeKUT\'s Centre for Data Science and AI is solving real-world problems.',
        content: `
# AI for Good: Inside DSAIL

Beyond mechatronics, Dedan Kimathi University is a hub for advanced algorithmic research through its **Centre for Data Science and Artificial Intelligence (DSAIL)**. The center focuses on applying AI and the Internet of Things (IoT) to solve unique African challenges.

## Conservation & Environment
One of DSAIL's standout projects involves **bio-acoustics and computer vision** for conservation:
- **Species Detection:** using camera trap images and AI models to automatically identify and track wildlife populations.
- **River Monitoring:** IoT sensors deployed in rivers to monitor water quality parameters in real-time, aiding in environmental protection.

## Intelligent Agriculture
DSAIL is also leveraging machine learning to boost food security:
- **Crop Yield Prediction:** Analyzing weather data and soil conditions to predict harvest outcomes.
- **Pest Detection:** Early warning systems that identify pest infestations using image recognition on mobile devices.

## The "AR Edu" Initiative
Bridging AI and education, students have developed **"AR Edu"**, an AI-powered app designed for the Competency-Based Curriculum (CBC). It uses Augmented Reality to bring textbook diagrams to life, allowing students to interact with 3D models of biological systems, chemical structures, and physical phenomena.

DSAIL proves that AI research isn't just theoretical—it's a practical tool for building a sustainable future.
    `,
        coverImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
        category: 'AI & Data Science',
        tags: JSON.stringify(['AI', 'DSAIL', 'Conservation', 'Agriculture', 'IoT']),
        authorName: 'AI Researcher',
        authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        readTime: '6 min',
        featured: false,
    },
    {
        slug: 'future-of-learning-vr-education',
        title: 'The Future of Learning: VR in Engineering Education',
        excerpt: 'Why Virtual Reality is the ultimate tool for next-generation STEM learning.',
        content: `
# Beyond the Classroom: Why VR is Transforming Education

The traditional lecture hall is evolving. Research into Virtual Reality (VR) in education reveals a transformative potential that goes far beyond simple novelty. For engineering and technical fields, VR is becoming an indispensable tool.

## 1. Immersive & Experiential Learning
VR offers **"Learning by Doing"**. Instead of reading about a turbine engine, students can step inside one. This experiential approach builds deeper cognitive connections and improves memory retention by up to **75%** compared to traditional methods.

## 2. Safe Failure
In a physical lab, a mistake can be dangerous or expensive. In VR, a student can crash a drone, overheat a reactor, or miswire a circuit with zero consequences. This "safe failure" encourages experimentation and builds confidence.

## 3. visualizing the Abstract
Complex concepts—like electromagnetic fields, fluid dynamics, or molecular structures—are often hard to visualize. VR brings these abstract ideas into 3D space, making the invisible visible and the complex intuitive.

## 4. Accessibility & Scale
Not every school can afford a million-dollar robotics arm. But a VR headset can simulate that arm for a fraction of the cost. DeKUT's VML helps democratize access to high-end equipment, ensuring that students across Africa can train on industry-standard tools regardless of physical resource limitations.

## Conclusion
As hardware becomes more affordable and software more sophisticated, VR is set to become the standard interface for technical education. The future of learning isn't just digital; it's immersive.
    `,
        coverImageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=1200',
        category: 'Education',
        tags: JSON.stringify(['VR', 'Education', 'EdTech', 'Future of Work']),
        authorName: 'EdTech Specialist',
        authorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        readTime: '7 min',
        featured: true,
    }
];

async function main() {
    console.log('Start seeding articles...');

    for (const article of articles) {
        const created = await prisma.article.upsert({
            where: { slug: article.slug },
            update: article,
            create: article,
        });
        console.log(\`Upserted article: \${created.title}\`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

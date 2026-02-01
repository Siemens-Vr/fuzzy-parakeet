export interface Article {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: 'News' | 'Tips' | 'Hidden Gems' | 'Blog' | 'Review';
    author: {
        name: string;
        avatar: string;
    };
    publishedAt: string;
    readTime: string;
    featured?: boolean;
}

export const MOCK_ARTICLES: Article[] = [
    {
        id: '1',
        slug: 'best-free-vr-games-2026',
        title: 'The Best Free VR Games on Meta Quest in 2026',
        excerpt: 'Discover the top-rated free experiences that provide hours of fun without spending a dime.',
        content: `
      <h2>The Golden Age of Free VR</h2>
      <p>In 2026, the VR landscape has shifted. While premium AAA titles still command high prices, the "Free-to-Play" and community-driven sectors have exploded in quality. Meta's latest headset iterations have made VR more accessible than ever, and these developers are taking full advantage.</p>
      
      <h3>1. Spatial Arena: Legends</h3>
      <p>This isn't just a combat game; it's a social phenomenon. Spatial Arena combines the tactical depth of competitive shooters with the effortless movement possible only in VR. With zero cost to entry and a robust progression system, it's a must-install.</p>
      
      <blockquote>"The movement feels like second nature. I haven't touched a traditional console in months." - VR Weekly</blockquote>
      
      <h3>2. Zen Garden VR</h3>
      <p>Sometimes you just need to breathe. Zen Garden VR offers high-fidelity meditative spaces where you can interact with nature, practice mindfulness, or just relax after a long day. The procedural generation ensures that no two sessions are exactly the same.</p>
      
      <h3>Why Free Matters</h3>
      <p>Free experiences are the gateway to the metaverse. They lower the barrier to entry and allow users to find their "VR legs" without financial risk. As we look forward to the rest of 2026, expect even more high-quality free content to dominate the charts.</p>
    `,
        image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=800',
        category: 'Hidden Gems',
        author: {
            name: 'VR Enthusiast',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        },
        publishedAt: '2026-01-30',
        readTime: '8 min',
        featured: true
    },
    {
        id: '2',
        slug: 'meta-quest-pro-2-rumors',
        title: 'Meta Quest Pro 2: Everything We Know So Far',
        excerpt: 'Leaks, rumors, and speculation about the next premium headset from Meta.',
        content: `
      <h2>The Precision of Pro</h2>
      <p>Whispers from the supply chain suggest that Meta is gearing up for a major professional headset reveal. The Meta Quest Pro 2 isn't just an iteration; it's rumored to be a complete redesign of what "Pro" means in the XR space.</p>
      
      <h3>Micro-OLED and Beyond</h3>
      <p>The biggest rumor? Dual Micro-OLED displays with 4K resolution per eye. If true, this would put Meta in direct competition with high-end PCVR headsets while maintaining a standalone form factor.</p>
      
      <ul>
        <li>4K per eye resolution</li>
        <li>Advanced eye and face tracking</li>
        <li>Next-gen pancake lenses with 110-degree FOV</li>
        <li>Snapdragon XR3 Gen 2 Processor</li>
      </ul>
      
      <p>While Meta hasn't confirmed anything yet, the aggressive patent filings over the last six months point towards a late 2026 / early 2027 release window.</p>
    `,
        image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&q=80&w=800',
        category: 'News',
        author: {
            name: 'Tech Insider',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'
        },
        publishedAt: '2026-01-28',
        readTime: '5 min'
    },
    {
        id: '3',
        slug: 'vr-fitness-tips',
        title: 'Top 5 VR Fitness Apps to Keep You Moving',
        excerpt: 'Turn your workout into a game with these immersive fitness experiences.',
        content: `
      <h2>Fitness is a Game</h2>
      <p>Forget the treadmill. In 2026, thousands of people are getting their daily cardio in virtual reality. It's more engaging, less monotonous, and significantly more fun than traditional gym routines.</p>
      
      <h3>The Top Contenders</h3>
      <p>From rhythm games to boxing simulators, the variety in VR fitness is staggering. Our top pick this month is <strong>Rhythm Rush</strong>, which has introduced a new "Full Body" mode utilizing the latest inside-out tracking improvements.</p>
      
      <p>Whether you're looking for a quick 15-minute HIIT session or an hour-long endurance test, there's an app that fits your goals. Just remember to use a silicone face cover and stay hydrated!</p>
    `,
        image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800',
        category: 'Tips',
        author: {
            name: 'FitVR Coach',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack'
        },
        publishedAt: '2026-01-25',
        readTime: '6 min'
    },
    {
        id: '4',
        slug: 'indie-spotlight-spatial-gliding',
        title: 'Indie Spotlight: Spatial Gliding Redefines VR Movement',
        excerpt: 'How one small developer is pushing the boundaries of locomotive comfort.',
        content: `
      <h2>Movement without Motion Sickness</h2>
      <p>The "holy grail" of VR has always been smooth locomotion without the associated nausea. A small indie team from Sweden might have finally cracked the code with their new "Spatial Gliding" mechanic.</p>
      
      <h3>The Secret Sauce</h3>
      <p>Instead of simple artificial movement, Spatial Gliding uses subtle visual cues and peripheral masking to trick the brain into accepting the motion. It feels like surfing on air, and the results from beta testing are incredibly promising.</p>
      
      <p>We'll be keeping a close eye on this team as they prepare for a full Early Access release on the VR Store later this year.</p>
    `,
        image: 'https://images.unsplash.com/photo-1478410189057-040220c3abe7?auto=format&fit=crop&q=80&w=800',
        category: 'Hidden Gems',
        author: {
            name: 'Indie Scout',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        },
        publishedAt: '2026-01-20',
        readTime: '10 min'
    }
];

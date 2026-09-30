// Problem solving, courses and life outside the editor.

export const leetcode = {
  profile: "https://leetcode.com/u/c3CgTUeJ4W/",
  solved: 97,
  easy: 21,
  medium: 61,
  hard: 15,
  rating: 1460,
  activeDays: 81,
  maxStreak: 28,
  asOf: "September 2026",
} as const;

export const dsa = {
  heading: "Depth over count.",
  body: [
    `I’d rather spend an evening on one hard problem than on ten easy ones. On LeetCode, ${leetcode.medium + leetcode.hard} of my ${leetcode.solved} solves are Medium or Hard; 40 are dynamic programming.`,
    "Most of my practice happens locally, in Java, one folder per topic — graphs, DP, heaps, tries. That’s where the other hundred-odd problems live.",
  ],
  stats: [
    { value: 200, suffix: "+", label: "problems solved across platforms" },
    {
      value: leetcode.medium + leetcode.hard,
      suffix: "",
      label: `of ${leetcode.solved} LeetCode solves are Medium or Hard`,
    },
    { value: leetcode.rating, suffix: "", label: "LeetCode contest rating" },
  ],
  // Real problems: recent LeetCode accepts plus the local Java practice folders.
  lanes: [
    [
      "Burst Balloons",
      "Edit Distance",
      "Minimum Cost to Cut a Stick",
      "Partition Array for Maximum Sum",
      "Matrix-Chain Multiplication",
      "Longest Increasing Subsequence",
      "Longest Common Subsequence",
      "0/1 Knapsack",
      "Rod Cutting",
      "Catalan Numbers",
      "Longest Path in a Matrix",
      "Target Sum Subset",
    ],
    [
      "Kosaraju’s SCC",
      "Tarjan’s Algorithm",
      "Disjoint Set Union",
      "Topological Sort",
      "Alien Dictionary",
      "Prim’s MST",
      "Connecting Cities",
      "BFS / DFS",
      "Tries",
      "Segment Trees",
      "Sliding Window Maximum",
      "K Weakest Rows",
    ],
  ],
} as const;

export const courses = [
  {
    title: "Sigma — Full-Stack Web Development + DSA",
    by: "Apna College",
    status: "done" as const,
    note: "The foundation: JavaScript, Node, MongoDB, React — and DSA in Java.",
  },
  {
    title: "Fundamentals of Networking for Effective Backends",
    by: "Hussein Nasser · Udemy",
    status: "done" as const,
    note: "TCP vs UDP, NAT, proxies, TLS. Wrote a UDP server and port-forwarding experiments alongside.",
  },
  {
    title: "Fundamentals of Backend Engineering",
    by: "Hussein Nasser · Udemy",
    status: "active" as const,
    note: "Protocols, communication patterns and execution models — the theory under the systems above.",
  },
];

export const life = {
  heading: "Off the clock.",
  swim: {
    title: "Swimmer first.",
    body: "I swam competitively in district tournaments and came home with silver in the 100 m freestyle and the 50 m backstroke. Swimming taught me what I still believe: race day only shows the training you’ve already done.",
    results: [
      { event: "100 m Freestyle", medal: "Silver", level: "District" },
      { event: "50 m Backstroke", medal: "Silver", level: "District" },
    ],
  },
  gym: { title: "Gym, every day.", body: "An hour and a half, seven days a week, around a full college schedule." },
  badminton: { title: "Badminton on weekends.", body: "Any sport, really — as long as someone’s keeping score." },
  music: { title: "Music, always.", body: "I love music, and I sing whenever I get the chance." },
  reading: {
    title: "Reading.",
    body: "Self-improvement books, mostly. They all end up saying the same thing: discipline compounds.",
  },
} as const;

// Problem solving, courses and life outside the editor.

export const dsa = {
  heading: "Depth over count.",
  body: [
    "I don’t grind a hundred easy array problems to make a number go up. I spend the time where problems actually get hard — dynamic programming and graphs.",
    "Most of my practice happens locally, in Java, in a folder per topic. LeetCode is where some of it shows up.",
  ],
  // TODO(chirag): keep these in sync with your real counts.
  stats: [
    { value: 200, suffix: "+", label: "problems solved across platforms" },
    { value: 100, suffix: "", label: "on LeetCode" },
    { value: 90, suffix: "", label: "of those on DP & graphs" },
  ],
  leetcode: { total: 100, deep: 90 },
  // Real problems from the local Java practice folders.
  lanes: [
    [
      "0/1 Knapsack",
      "Edit Distance",
      "Matrix-Chain Multiplication",
      "Longest Increasing Subsequence",
      "Longest Common Subsequence",
      "Longest Common Substring",
      "Rod Cutting",
      "Catalan Numbers",
      "Target Sum Subset",
      "Longest Path in a Matrix",
      "Stacking Boxes",
      "Jump Game",
    ],
    [
      "Kosaraju’s SCC",
      "Tarjan’s Algorithm",
      "Disjoint Set Union",
      "Alien Dictionary",
      "Prim’s MST",
      "Connecting Cities",
      "BFS / DFS",
      "Tries",
      "Segment Trees",
      "Sliding Window Maximum",
      "Connect N Ropes",
      "K Weakest Rows",
    ],
  ],
  topics: ["Dynamic programming", "Graphs", "Trees", "Heaps", "Tries", "Segment trees", "Backtracking", "Recursion"],
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
    // TODO(chirag): the second sentence is a draft — make it yours.
    body: "I swam competitively at district level. Racing is where I learned that results are just training, added up.",
    // TODO(chirag): add years / district name if you want them shown.
    results: [
      { event: "100 m Freestyle", medal: "Silver", level: "District" },
      { event: "50 m Backstroke", medal: "Silver", level: "District" },
    ],
  },
  gym: { title: "Gym, every day.", body: "An hour and a half, seven days a week, around a full college schedule." },
  badminton: { title: "Badminton on weekends.", body: "Any sport, really — as long as someone’s keeping score." },
  music: { title: "Music, always.", body: "I love music, and I love to sing." },
  reading: {
    title: "Reading.",
    body: "Self-improvement books, mostly. They all end up saying the same thing: discipline compounds.",
  },
} as const;

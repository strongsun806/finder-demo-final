module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#eef6ff", 200:"#bfdbfe", 700:"#1d4ed8" },
      },
      boxShadow: {
        soft: "0 8px 20px rgba(2,89,255,.06)",
      },
    },
  },
  plugins: [],
};
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#0F1628",
          hover: "#1B243A",
          text: "#C7D0E0",
        },
        layout: {
          bg: "#F5F6FA",
          card: "#FFFFFF",
          header: "#FFFFFF",
        },
        table: {
          header: "#F2F4F7",
          border: "#E5E7EB",
        },
      },
    },
  },
  plugins: [],
};

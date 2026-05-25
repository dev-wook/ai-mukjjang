import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aiMukjjang: {
          orange: "#f97316",
          amber: "#f59e0b"
        }
      },
      boxShadow: {
        "orange-glow": "0 0 32px rgba(249, 115, 22, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;

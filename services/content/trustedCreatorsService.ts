export type TrustedCreator = {
  id: string;
  name: string;
  profileUrl: string;
  description: string;
  profileImage: number;
};

const TRUSTED_CREATORS: TrustedCreator[] = [
  {
    id: "tonichi-bonoan",
    name: "Tonichi Bonoan",
    profileUrl: "https://www.facebook.com/tonichi.bonoan",
    description: "Personal finance and investing education for Filipino beginners.",
    profileImage: require("@/assets/creators/tonichi.jpg"),
  },
  {
    id: "truly-rich-club",
    name: "Truly Rich Club",
    profileUrl: "https://www.facebook.com/officialtrulyrichclub",
    description: "Long-term wealth building and values-based investing content.",
    profileImage: require("@/assets/creators/truly-rich-club.jpg"),
  },
  {
    id: "juan-for-the-money",
    name: "Juan For The Money",
    profileUrl: "https://www.facebook.com/juanforthemoney",
    description: "Taglish-friendly explainers on stocks, ETFs, and money habits.",
    profileImage: require("@/assets/creators/juan-for-the-money.jpg"),
  },
  {
    id: "jacques-jax-reyes",
    name: "Jacques Jax Reyes",
    profileUrl: "https://www.facebook.com/jacquesjax.reyes",
    description: "Beginner-focused market education and practical learning content.",
    profileImage: require("@/assets/creators/jac-reyes.jpg"),
  },
  {
    id: "jem-and-jec",
    name: "Jem and Jec",
    profileUrl: "https://www.facebook.com/JemAndJec",
    description: "Educational videos on investing mindset and financial literacy.",
    profileImage: require("@/assets/creators/jem-and-jec.jpg"),
  },
];

export function getTrustedCreators(): TrustedCreator[] {
  return TRUSTED_CREATORS;
}

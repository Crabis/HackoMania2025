export type AddictionTab = {
    category: string
    number: number
    donation_amount: number
    title: string
    subtitle: string
    backgroundImage: string
    imageSrc: string[]
}
  
export const addictionsTabData: AddictionTab[] = [
  {
    category: "Smoking",
    number: 205,
    donation_amount: 1048.64,
    title: "Quit Smoking Program",
    subtitle: "Break free from nicotine addiction",
    backgroundImage: "/images/smoking-recovery.png",
    imageSrc: [
      "/images/smoking-recovered1.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B3A7A57D7-3709-428A-A232-15F783970920%7D-Jd8MAhDpANR4lUeVTJQxMf9xfnVuc6.png",
    ],
  },
  {
    category: "Alcohol",
    number: 312,
    donation_amount: 2356.12,
    title: "Alcohol Recovery",
    subtitle: "Reclaim your life from alcohol dependence",
    backgroundImage: "/images/alcohol-recovery.png",
    imageSrc: [
      "/images/smoking-recovered1.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B3A7A57D7-3709-428A-A232-15F783970920%7D-Jd8MAhDpANR4lUeVTJQxMf9xfnVuc6.png",
    ],
  },
  {
    category: "Drugs",
    number: 178,
    donation_amount: 3789.5,
    title: "Drug Rehabilitation",
    subtitle: "Overcome substance abuse and start anew",
    backgroundImage: "/images/drug-recovery.png",
    imageSrc: [
      "/images/smoking-recovered1.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B3A7A57D7-3709-428A-A232-15F783970920%7D-Jd8MAhDpANR4lUeVTJQxMf9xfnVuc6.png",
    ],
  },
]


// Singapore Public Holidays and Key Celebrations for 2026 (From National Day Aug 9 onwards)
export const HOLIDAYS_2026_ONWARDS = [
  {
    id: "ndp-2026",
    name: "Singapore National Day",
    date: "2026-08-09",
    category: "MOM Public Holiday",
    badgeText: "Celebrate SG 61",
    subtitle: "Majulah Singapura • Honoring 61 years of unity, resilience & innovation",
    theme: "national-day",
    culturalContext: "Singapore's 61st National Day celebrating nation building, multicultural harmony, and future-forward innovation.",
    suggestedHashtags: ["#NationalDay2026", "#NDP2026", "#MajulahSingapura", "#BrotherSingapore", "#AtYourSide"]
  },
  {
    id: "mid-autumn-2026",
    name: "Mid-Autumn Festival",
    date: "2026-09-25",
    category: "Cultural Celebration",
    badgeText: "Mooncake & Reunion Special",
    subtitle: "Celebrating family harmony, gratitude & glowing connections",
    theme: "mid-autumn",
    culturalContext: "Mid-Autumn Festival celebrates family reunions, Thanksgiving, harmony, and sharing mooncakes with colleagues and loved ones.",
    suggestedHashtags: ["#MidAutumnFestival", "#MooncakeFestival", "#Reunion", "#BrotherSingapore", "#AtYourSide"]
  },
  {
    id: "childrens-day-2026",
    name: "Children's Day",
    date: "2026-10-02",
    category: "Special Occasion",
    badgeText: "Empowering Young Minds",
    subtitle: "Inspiring creativity, curiosity & future generation innovators",
    theme: "childrens-day",
    culturalContext: "Celebrating the boundless creativity and dreams of children, nurturing the next generation of Singapore innovators.",
    suggestedHashtags: ["#ChildrensDay", "#InspiringYoungMinds", "#LifeAtBrother", "#BrotherSingapore", "#AtYourSide"]
  },
  {
    id: "deepavali-2026",
    name: "Deepavali (Festival of Lights)",
    date: "2026-11-08",
    category: "MOM Public Holiday",
    badgeText: "Festival of Lights",
    subtitle: "May the divine light illuminate your path with joy, wisdom & prosperity",
    theme: "deepavali",
    culturalContext: "Deepavali signifies the victory of light over darkness and knowledge over ignorance across Singapore's vibrant Indian community.",
    suggestedHashtags: ["#Deepavali2026", "#FestivalOfLights", "#JoyAndProsperity", "#BrotherSingapore", "#AtYourSide"]
  },
  {
    id: "christmas-2026",
    name: "Christmas Day",
    date: "2026-12-25",
    category: "MOM Public Holiday",
    badgeText: "Year-End Season of Giving",
    subtitle: "Warmest wishes of peace, joy and gratitude to all our partners",
    theme: "christmas",
    culturalContext: "Celebrating the warmth of giving, camaraderie, and reflecting on a fruitful year standing beside our clients.",
    suggestedHashtags: ["#MerryChristmas", "#SeasonOfGiving", "#YearEndCelebration", "#BrotherSingapore", "#AtYourSide"]
  },
  {
    id: "new-year-eve-2026",
    name: "New Year's Eve & Welcome 2027",
    date: "2026-12-31",
    category: "Festive Milestone",
    badgeText: "Welcome 2027",
    subtitle: "Stepping boldly into a new year of digital breakthroughs & shared success",
    theme: "new-year",
    culturalContext: "Welcoming 2027 with renewed energy, reflecting on milestones, and looking ahead to smart workplace automation.",
    suggestedHashtags: ["#NewYear2027", "#HappyNewYear", "#BrotherXplorer", "#BrotherSingapore", "#AtYourSide"]
  }
];

export function get2026HolidaysWithDays(refDate = new Date("2026-08-23")) {
  return HOLIDAYS_2026_ONWARDS.map(item => {
    const target = new Date(item.date);
    const diffTime = target - refDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status = `${diffDays} days away`;
    let isUrgent = false;

    if (diffDays >= 0 && diffDays <= 15) {
      status = "Action Needed (T-10 Window Active)";
      isUrgent = true;
    } else if (diffDays < 0) {
      status = "Past";
    }

    return {
      ...item,
      daysRemaining: diffDays,
      status,
      isUrgent
    };
  });
}

export const MOCK_CREDITS = 1250;
export const MOCK_USER_COUNT = 15420;
export const MOCK_SUBSCRIPTION_PLAN = "pro";

export const mockGetCredits = async () => {
  return {
    credits: 1000,
    extraCredits: 250,
    subscriptionPlan: MOCK_SUBSCRIPTION_PLAN,
    isTeamMember: false,
  };
};

export const mockGetUserCount = async () => {
  return { count: MOCK_USER_COUNT };
};

export const mockGetHumanizerHistory = async () => {
  return {
    success: true,
    history: [
      {
        id: "1",
        originalText: "Artificial intelligence is the simulation of human intelligence processes by machines.",
        humanizedText: "AI is essentially about creating machines that can think and learn much like humans do.",
        preset: "default",
        tokensUsed: 15,
        aiScore: 98,
        createdAt: new Date(),
      },
      {
        id: "2",
        originalText: "The climate change is a significant challenge for the future of humanity.",
        humanizedText: "Addressing climate change is one of the most important hurdles our generation faces.",
        preset: "professional",
        tokensUsed: 22,
        aiScore: 95,
        createdAt: new Date(Date.now() - 86400000),
      }
    ]
  };
};

export const mockGetSubscriptionDetails = async () => {
  return {
    subscriptionPlan: "pro",
    subscriptionType: "monthly",
    nextResetDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    billingCycle: "Monthly",
    status: "active",
    cancelAtPeriodEnd: false,
  };
};

export const simulateHumanizerStream = async (text: string, onChunk: (chunk: string) => void) => {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    // Simulate some simple "humanization" by just returning words with slight delay
    onChunk(words[i] + " ");
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

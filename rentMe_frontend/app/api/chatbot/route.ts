import { generateText, tool } from "ai"
import { z } from "zod"
import { dummyBookings, dummyVehicles } from "@/lib/dummy-data"

export const maxDuration = 30

const getUserBookings = tool({
  description: "Get all bookings for a specific user",
  inputSchema: z.object({
    userId: z.string(),
  }),
  execute: async ({ userId }) => {
    const userBookings = dummyBookings.filter((b) => b.renter.id === userId)
    return userBookings.map((b) => ({
      id: b.id,
      vehicle: `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model}`,
      pickupDate: b.pickup_date,
      returnDate: b.return_date,
      status: b.status,
      totalPrice: b.total_price,
    }))
  },
})

const getVehicleDetails = tool({
  description: "Get details about a specific vehicle",
  inputSchema: z.object({
    vehicleId: z.string(),
  }),
  execute: async ({ vehicleId }) => {
    const vehicle = dummyVehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return "Vehicle not found"
    return {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      capacity: vehicle.capacity,
      dailyPrice: vehicle.daily_price,
      availability: vehicle.availability,
      rating: vehicle.rating,
    }
  },
})

const getSystemFAQ = tool({
  description: "Get frequently asked questions about the rental system",
  inputSchema: z.object({}),
  execute: async () => {
    return {
      faqs: [
        {
          question: "How do I rent a vehicle?",
          answer:
            "Browse available vehicles, select one, provide your details, and confirm the booking. Our system will process your request and send confirmation details.",
        },
        {
          question: "What is the cancellation policy?",
          answer:
            "You can cancel bookings up to 24 hours before pickup for a full refund. Cancellations within 24 hours may incur a fee.",
        },
        {
          question: "How do I contact the vehicle owner?",
          answer:
            "You can message the owner directly through the chat feature on the vehicle detail page or in your messages section.",
        },
        {
          question: "What documents do I need?",
          answer:
            "A valid driver's license and identity document are required. For first-time renters, we may ask for additional verification.",
        },
        {
          question: "How are prices calculated?",
          answer:
            "Prices are based on the daily rate multiplied by the number of rental days. No hidden fees - what you see is what you pay.",
        },
      ],
    }
  },
})

export async function POST(req: Request) {
  const { message, userId, userRole, conversationHistory } = await req.json()

  const systemPrompt = `You are a helpful RentMe vehicle rental assistant. You help users with:
1. Information about their bookings and rental history
2. Details about available vehicles
3. FAQs and platform information
4. Booking process guidance

Current user: ${userId} (Role: ${userRole})
Today's date: ${new Date().toISOString()}

Be friendly, concise, and helpful. Use the available tools to provide accurate information.`

  const conversationContext = conversationHistory
    .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n")

  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      system: systemPrompt,
      tools: {
        getUserBookings,
        getVehicleDetails,
        getSystemFAQ,
      },
      prompt: `${conversationContext}\n\nUser: ${message}`,
      maxOutputTokens: 500,
    })

    return Response.json({ response: text })
  } catch (error) {
    console.error("[v0] Chatbot error:", error)
    return Response.json(
      { response: "I encountered an error processing your request. Please try again." },
      { status: 500 },
    )
  }
}

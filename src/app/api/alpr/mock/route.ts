// src/app/api/alpr/mock/route.ts
import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const alprRequestSchema = z
  .object({
    imageUrl: z.string().url().optional(),
    imageBase64: z.string().optional(),
    confidence: z.number().min(0).max(1).default(0.8),
  })
  .refine((data) => data.imageUrl || data.imageBase64, {
    message: 'Either imageUrl or imageBase64 must be provided',
  });

// Mock ALPR response
const generateMockPlate = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const letter3 = letters[Math.floor(Math.random() * letters.length)];
  const number1 = numbers[Math.floor(Math.random() * numbers.length)];
  const number2 = numbers[Math.floor(Math.random() * numbers.length)];
  const number3 = numbers[Math.floor(Math.random() * numbers.length)];

  return `${letter1}${letter2}${letter3} ${number1}${number2}${number3}`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = alprRequestSchema.parse(body);

    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Generate mock response
    const mockResponse = {
      success: true,
      results: [
        {
          plate: generateMockPlate(),
          confidence: validatedData.confidence + (Math.random() - 0.5) * 0.2,
          coordinates: {
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100),
            width: Math.floor(Math.random() * 200) + 100,
            height: Math.floor(Math.random() * 50) + 30,
          },
          vehicle: {
            make: ['Toyota', 'Ford', 'BMW', 'Mercedes', 'Honda'][
              Math.floor(Math.random() * 5)
            ],
            model: ['Sedan', 'SUV', 'Hatchback', 'Truck'][
              Math.floor(Math.random() * 4)
            ],
            color: ['White', 'Black', 'Silver', 'Red', 'Blue'][
              Math.floor(Math.random() * 5)
            ],
          },
        },
      ],
      processingTime: Math.floor(Math.random() * 3000) + 1000,
      timestamp: new Date().toISOString(),
    };

    logger.info('Mock ALPR processing completed', {
      plate: mockResponse.results[0].plate,
      confidence: mockResponse.results[0].confidence,
      processingTime: mockResponse.processingTime,
    });

    return NextResponse.json(mockResponse);
  } catch (error) {
    logger.error('Mock ALPR error', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

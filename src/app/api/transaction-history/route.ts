import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.json(
    [
      {
        date: "24 Aug 2023",
        referenceId: "#8434343434342",
        to: "Bloom Enterprise Sdn Bhd",
        subtext: "Recipient references will go here",
        type: "DuitNow payment",
        amount: "RM 1,200.00",
      },
      {
        date: "14 Jul 2023",
        referenceId: "#8434343434342",
        to: "Muhammad Andy Asrawi",
        subtext: "Recipient references will go here",
        type: "DuitNow payment",
        amount: "RM 54,810.16",
      },
      {
        date: "12 Jul 2023",
        referenceId: "#8434343434342",
        to: "Utilities Company Sdn Bhd",
        subtext: "Recipient references will go here",
        type: "DuitNow payment",
        amount: "RM 100.00",
      },
    ],
    {
      status: 200,
    }
  );
}

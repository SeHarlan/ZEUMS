import { getMintDates } from "@/server/services/estimateMintDates";
import { standardErrorResponses } from "@/utils/server";
import { NextRequest, NextResponse } from "next/server";

export async function getMintDatesHandler(
  req: NextRequest
): Promise<NextResponse> {
  try {

    const { mintAddresses } = (await req
      .text()
      .then((data) => JSON.parse(data))) as { mintAddresses: string[] };

    if (!mintAddresses?.length) {
      return NextResponse.json({}, { status: 204 });
    }

    const addressDatesMap = await getMintDates(mintAddresses);

    return NextResponse.json({ addressDatesMap }, { status: 200 });
  } catch (error) {
    return standardErrorResponses({
      error,
      location: "handlers-getMintDates",
      report: true,
    });
  }
}

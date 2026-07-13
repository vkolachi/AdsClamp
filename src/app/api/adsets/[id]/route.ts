import { NextRequest, NextResponse } from "next/server";
import { fbPost, fbDelete } from "@/lib/fb";

// POST /api/adsets/[id] — update status, budget, name
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await fbPost(`/${id}`, body);
    return NextResponse.json({ success: !result.error, data: result });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/adsets/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await fbDelete(`/${id}`);
    return NextResponse.json({ success: result.success ?? !result.error, data: result });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

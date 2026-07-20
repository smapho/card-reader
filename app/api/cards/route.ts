import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Supabase が未接続です。環境変数を確認してください。" }, { status: 500 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("cards").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "Supabase が未接続です。環境変数を確認してください。" }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();
  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json({ error: "画像が必要です。" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "");
  const company = String(form.get("company") ?? "");
  const title = String(form.get("title") ?? "");
  const email = String(form.get("email") ?? "");
  const phone = String(form.get("phone") ?? "");
  const website = String(form.get("website") ?? "");
  const notes = String(form.get("notes") ?? "");

  const fileName = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}_${image.name}`;
  const { error: uploadError } = await supabase.storage
    .from("business-card-images")
    .upload(fileName, image, { contentType: image.type, upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }
  const { data: urlData } = supabase.storage.from("business-card-images").getPublicUrl(fileName);

  const { data, error } = await supabase.from("cards").insert([{ name, company, title, email, phone, website, notes, image_url: urlData.publicUrl }]).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getTemplateById } from "@/lib/templates";
import { TemplateGenerateForm } from "@/components/templates/TemplateGenerateForm";
import { ArrowLeft } from "lucide-react";

export default function TemplateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  const Icon = template.icon;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/templates">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          テンプレート一覧に戻る
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Icon className="h-10 w-10 shrink-0 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{template.title}</h1>
              <p className="text-muted-foreground mt-1">{template.description}</p>
              <span className="inline-block mt-2 text-xs text-muted-foreground">
                {template.subcategory}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TemplateGenerateForm template={template} />
        </CardContent>
      </Card>
    </div>
  );
}

import { ActivityFeed } from "@/components/activity/activity-feed";
import { PageHeader } from "@/components/app/enterprise-page";
import { fetchAuditLogs } from "@/lib/api/audit";

export default async function ActivityPage() {
  const auditPage = await fetchAuditLogs({
    userId: "",
    action: "",
    entity: "",
    from: "",
    to: "",
    page: 0,
    size: 50
  });

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Realtime"
        title="Activity Feed"
        description="Timeline viva de eventos, autenticacao, mudancas operacionais e presenca de usuarios conectados."
      />
      <ActivityFeed initialLogs={auditPage.content} />
    </main>
  );
}

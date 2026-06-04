import EAForm from '@/components/admin/EAForm';

interface EditEAPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditEAPage({ params }: EditEAPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">
          Edit Expert Advisor Configuration
        </h1>
        <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
          Modify algorithmic rules, upload backtests, edit pricing packages, and adjust configuration settings.
        </p>
      </div>

      <EAForm eaId={id} />
    </div>
  );
}

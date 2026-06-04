import EAForm from '@/components/admin/EAForm';

export default function AdminNewEAPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">
          List New Expert Advisor
        </h1>
        <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
          Publish a new algorithm product package, backtest benchmarks, and pricing assets.
        </p>
      </div>

      <EAForm />
    </div>
  );
}

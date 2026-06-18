import { AuthGuard } from "@/components/auth/AuthGuard";
import { TradingLayout } from "@/components/layout/TradingLayout";
import { TradingProviders } from "@/providers/TradingProviders";

type Props = {
  params: Promise<{
    marketId: string;
  }>;
};

async function TradePage({ params }: Props) {
  const { marketId } = await params;
  return (
    <AuthGuard>
      <TradingProviders>
        <TradingLayout marketId={marketId} />
      </TradingProviders>
    </AuthGuard>
  );
}

export default TradePage;

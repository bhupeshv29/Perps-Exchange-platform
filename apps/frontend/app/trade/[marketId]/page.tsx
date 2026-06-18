import { AuthGuard } from "@/components/auth/AuthGuard";
import { TradingLayout } from "@/components/layout/TradingLayout";

type Props = {
  params: Promise<{
    marketId: string;
  }>;
};

async function TradePage({ params }: Props) {
  const { marketId } = await params;
  return (
    <AuthGuard>
      <TradingLayout marketId={marketId} />
    </AuthGuard>
  );
}

export default TradePage;

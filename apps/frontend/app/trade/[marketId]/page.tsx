import { TradingLayout } from "@/components/layout/TradingLayout";


type Props = {
  params: Promise<{
    marketId: string;
  }>;
};

async function TradePage({ params }: Props) {
  const { marketId } = await params;
  return <TradingLayout marketId = {marketId}/>;
}

export default TradePage;

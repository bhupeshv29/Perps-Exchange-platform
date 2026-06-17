import { redirect } from "next/navigation";

const HomePage = () => {
  redirect("/trade/BTCUSDT");
};

export default HomePage;

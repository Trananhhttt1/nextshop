import AppBanner from "./_component/app.banner";
import AppListCategory from "./_component/app.list.category";

export default function Home() {
  console.log("Next js ");
  return (
    <div>
      <AppBanner />
      <AppListCategory />
    </div>
  );
}

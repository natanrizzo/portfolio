import { PageFrame } from "@/components/site/page-frame";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <PageFrame>{children}</PageFrame>
      <SiteFooter />
    </>
  );
}

import NavigationWrapper from "@/components/NavigationWrapper";

export default function DashboardLayout({ children }) {
  return (
    <NavigationWrapper>
      {children}
    </NavigationWrapper>
  );
}

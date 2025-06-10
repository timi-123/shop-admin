// This page is deprecated. Redirect to /my-social-feed for a unified Social Feed experience.
import { redirect } from "next/navigation";
export default function DeprecatedSocialFeedPage() {
  redirect("/my-social-feed");
  return null;
}
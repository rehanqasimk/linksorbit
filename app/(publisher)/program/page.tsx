import { redirect } from 'next/navigation';

export default function ProgramIndexPage() {
  // Redirect to programs list if someone navigates to /program without an ID
  redirect('/programs');
  
  // This won't execute due to the redirect, but is included for completeness
  return null;
}

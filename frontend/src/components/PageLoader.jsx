import { LoaderIcon } from "lucide-react";

export const PageLoader = function(){
   return (
    <div className="flex items-center justify-center h-screen">
      <LoaderIcon className="size-10 animate-spin" />
    </div>
  );
}
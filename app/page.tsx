import { Hero } from "@/components/sections/hero";
import { Work } from "@/components/sections/work";
import { OtherThings } from "@/components/sections/other-things";
import { AlongsideSchool } from "@/components/sections/alongside-school";
import { Tools } from "@/components/sections/tools";
import { Services } from "@/components/sections/services";
import { Taste } from "@/components/sections/taste";
import { Method } from "@/components/sections/method";
import { Info } from "@/components/sections/info";
import { E92 } from "@/components/sections/e92";
import { Questions } from "@/components/sections/questions";

export default function Home() {
  return <main id="main"><Hero /><Work /><OtherThings /><AlongsideSchool /><Taste /><Tools /><Services /><Method /><Info /><E92 /><Questions /></main>;
}

'use client';
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <div>
      <Header 
      onAddPolicy={() => {}}
      onSearch={() => {}}
      searchValue={''}
      />
    </div>
  );
}

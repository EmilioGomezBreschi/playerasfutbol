"use client";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-5">
      <div className="items-center justify-center text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Retro Clásicas</h1>
        <h2 className="text-lg font-light">
          Camisas históricas y vintage de épocas doradas del fútbol
        </h2>
      </div>
      <div className="flex md:flex-row flex-col justify-around w-auto md:w-full md:space-x-7 space-y-7 md:space-y-0 grow">
        <button
          className="flex flex-col w-full rounded-lg border cursor-pointer min-h-full"
          onClick={() => (window.location.href = "/retro")}
        >
          <div className="group flex-1 flex justify-center items-center md:h-full rounded-lg bg-red-500/70 hover:bg-red-500 transition-all duration-300">
            <Image
              src="/images/shirt.svg"
              alt="Playera de Fútbol"
              width={100}
              height={100}
              className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
            />
          </div>
          <h3 className="text-start text-lg font-bold p-7">Camisas Retro</h3>
        </button>
        <button
          className="flex flex-col w-full rounded-lg border cursor-pointer min-h-full"
          onClick={() => (window.location.href = "/jugador")}
        >
          <div className="group flex-1 flex justify-center items-center md:h-full rounded-lg bg-yellow-500/70 hover:bg-yellow-500 transition-all duration-300">
            <Image
              src="/images/shirt.svg"
              alt="Playera de Fútbol"
              width={100}
              height={100}
              className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
            />
          </div>
          <h3 className="text-start text-lg font-bold p-7">
            Camisas de Jugador
          </h3>
        </button>
        <button
          className="flex flex-col w-full rounded-lg border cursor-pointer min-h-full"
          onClick={() => (window.location.href = "/aficionado")}
        >
          <div className="group flex-1 flex justify-center items-center md:h-full rounded-lg bg-blue-900/70 hover:bg-blue-900 transition-all duration-300">
            <Image
              src="/images/shirt.svg"
              alt="Playera de Fútbol"
              width={100}
              height={100}
              className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
            />
          </div>
          <h3 className="text-start text-lg font-bold p-7">
            Camisas de Aficionado
          </h3>
        </button>
      </div>
      <footer className="mt-8 text-center text-sm text-black flex flex-row justify-around w-full">
        <div className="flex items-center flex-col space-y-3">
          <div className="w-15 h-15 bg-red-500/70 rounded-full flex justify-center items-center">
            <Image
              src="/images/shirtorange.svg"
              alt="Playera de Fútbol"
              width={40}
              height={40}
              className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
            />
          </div>
          <h3 className="text-center text-base font-extrabold">
            Retro Auténticas
          </h3>
          <p className="text-center text-sm font-bold text-gray-900">
            Camisas históricas con diseños originales y materiales vintage.
          </p>
        </div>
        <div className="flex items-center flex-col space-y-3">
          <div className="w-15 h-15 bg-yellow-500/70 rounded-full flex justify-center items-center">
            <Image
              src="/images/star.svg"
              alt="Playera de Fútbol"
              width={40}
              height={40}
              className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
            />
          </div>
          <h3 className="text-center text-base font-extrabold">
            Calidad Jugador
          </h3>
          <p className="text-center text-sm font-bold text-gray-900">
            Misma calidad que usan los profesionales en el campo.
          </p>
        </div>
        <div className="flex items-center flex-col space-y-3">
          <div className="w-15 h-15 bg-blue-900/70 rounded-full flex justify-center items-center">
            <Image
              src="/images/heart.svg"
              alt="Playera de Fútbol"
              width={40}
              height={40}
              className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
            />
          </div>
          <h3 className="text-center text-base font-extrabold">
            Para aficionados
          </h3>
          <p className="text-center text-sm font-bold text-gray-900">
            Diseños accesibles sin comprometer el estilo y la comodidad.
          </p>
        </div>
      </footer>
    </main>
  );
}

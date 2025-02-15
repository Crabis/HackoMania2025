const ActionSection: React.FC = () => {
    return (
      <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full">
        <div className="flex flex-col grow pt-8 w-full text-center text-black whitespace-nowrap bg-white rounded-2xl pb-[669px]">
          <div className="flex flex-col px-4 w-full">
            <div className="flex gap-10 self-start text-3xl font-bold">
              <div className="self-start basis-auto">Actions</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/842bc4456497529232495fd456638441a3d6677fd75f040b69b12d7398669f2e?placeholderIfAbsent=true&apiKey=3781f5fb14b54a8faadaa1825060b0d4"
                className="object-contain shrink-0 aspect-square fill-zinc-700 w-[45px]"
                alt=""
              />
            </div>
            <div className="flex gap-5 justify-between mt-20 text-2xl">
              <div className="self-start">Rewards</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/3c633dfa02480704a8e329ab303ffc66fad60c57fb52d1adc2e54f57672d8b97?placeholderIfAbsent=true&apiKey=3781f5fb14b54a8faadaa1825060b0d4"
                className="object-contain shrink-0 aspect-square w-[33px]"
                alt=""
              />
            </div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/3c633dfa02480704a8e329ab303ffc66fad60c57fb52d1adc2e54f57672d8b97?placeholderIfAbsent=true&apiKey=3781f5fb14b54a8faadaa1825060b0d4"
              className="object-contain self-end mt-11 aspect-square w-[33px]"
              alt=""
            />
          </div>
          <div className="shrink-0 mt-2.5 max-w-full border-2 border-solid border-neutral-400 border-opacity-80 h-[3px] w-[360px]" />
        </div>
      </div>
    );
  };
  
  export default ActionSection;
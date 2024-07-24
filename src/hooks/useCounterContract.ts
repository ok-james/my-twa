import { useEffect, useState } from "react";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import Counter from "../contracts/Counter";
import { Address, OpenedContract } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

export function useCounterContract() {
  const client = useTonClient();
  const [val, setVal] = useState<null | string>();
  const { sender } = useTonConnect();

  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const counterContract = useAsyncInitialize(async () => {
    if (!client) {
      return;
    }

    const contract = new Counter(
      Address.parse("EQCx3hBRkAKzPC0tQrKwYKoaEDl47Xn2sCKokIytBjWIqrau")
    );
    return client.open(contract) as OpenedContract<Counter>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!counterContract) {
        return;
      }

      setVal(null);
      const val = await counterContract.getCounter();
      setVal(val.toString());
      await sleep(5000);
      getValue();
    }

    getValue();
  }, [counterContract]);

  return {
    value: val,
    address: counterContract?.address.toString(),
    sendIncrement: () => {
      return counterContract?.sendIncrement(sender);
    },
  };
}

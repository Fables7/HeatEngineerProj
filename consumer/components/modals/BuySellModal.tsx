"use client";
import React, { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Slider } from "../ui/slider";

interface props {
  type: string;
  cash: number;
  stockPrice: number;
  portfolio: number;
  handleBuy: () => void;
  handleSell: () => void;
  setSellQuantity: Dispatch<SetStateAction<number>>;
  setBuyQuantity: Dispatch<SetStateAction<number>>;
  sellQuantity: number;
  buyQuantity: number;
}
type PropsWithoutType = Omit<props, "type">;

const Modal = ({
  type,
  cash,
  stockPrice,
  portfolio,
  handleSell,
  handleBuy,
  sellQuantity,
  buyQuantity,
  setBuyQuantity,
  setSellQuantity,
}: props) => {
  const maxBuy = Math.round(cash / stockPrice);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-400 rounded-full w-32 h-10 text-white font-bold hover:bg-blue-400">
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type} Heat Stocks</DialogTitle>
        </DialogHeader>
        <Separator />
        <h1 className="text-2xl font-bold">£{stockPrice}</h1>
        <h1 className="m-auto text-3xl text-blue-400 my-10">
          {type === "Buy" && "~"}
          {type === "Buy" ? buyQuantity : sellQuantity}
        </h1>
        <Slider
          defaultValue={[0]}
          max={type === "Buy" ? maxBuy : type === "Sell" ? portfolio : 0}
          step={1}
          onValueChange={(val) => {
            if (type === "Sell") {
              setSellQuantity(val[0]);
            }
            if (type === "Buy") {
              setBuyQuantity(val[0]);
            }
          }}
        />
        <DialogClose asChild>
          <Button
            className="bg-blue-400 rounded-full hover:bg-blue-400"
            onClick={() => {
              if (type === "Sell") {
                handleSell();
              }
              if (type === "Buy") {
                handleBuy();
              }
            }}
          >
            {type}
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

const types = ["Buy", "Sell"];

const BuySellModal = (props: PropsWithoutType) => {
  return (
    <div className="flex gap-4 py-6">
      {types.map((type) => (
        <Modal key={type} {...props} type={type} />
      ))}
    </div>
  );
};

export default BuySellModal;

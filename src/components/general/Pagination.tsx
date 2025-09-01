import { generateArrayAroundNumber } from "@/utils/math";
import { cn } from "@/utils/ui-utils";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { Button } from "../ui/button";

interface PaginationProps { 
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  perPage: number;
  totalItems: number;
  iconClass?: string;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  setPage,
  perPage,
  totalItems,
  iconClass = "w-5 h-5 stroke-2",
  className
}) => { 

  const totalPages = Math.ceil(totalItems / perPage) - 1;
  return (
    <div className={cn("relative mx-auto w-fit", className)}>
      <div className="flex justify-center items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setPage(0)}
          disabled={page === 0}
        >
          <ChevronsLeftIcon className={iconClass} />
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page === 0}
        >
          <ChevronLeftIcon className={iconClass} />
        </Button>

        <div className="lg:hidden font-bold px-2 ">
          {page + 1} / {totalPages + 1}
        </div>

        <div className="lg:flex hidden gap-1">
          {generateArrayAroundNumber({
            num: page,
            lowerBound: 0,
            upperBound: totalPages,
          }).map((num, i) => (
            <Button
              key={i}
              variant="outline"
              className={
                num === page ? "bg-primary text-primary-foreground pointer-events-none" : ""
              }
              onClick={() => setPage(num)}
            >
              {num + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRightIcon className={iconClass} />
        </Button>
        <Button
          variant="outline"
          onClick={() => setPage(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRightIcon className={iconClass} />
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
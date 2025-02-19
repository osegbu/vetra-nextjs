import { memo, useState, useCallback } from "react";
import styles from "./user.module.css";
import { useStore } from "@/lib/StoreContext";

const Search = () => {
  const { search } = useStore();
  const [searchValue, setSearchValue] = useState("");

  const handleInput = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);
    search(value);
  }, []);

  return (
    <div className={styles.searchEl}>
      <input
        type="search"
        placeholder="Search"
        name="search"
        value={searchValue}
        onChange={handleInput}
      />
    </div>
  );
};

export default memo(Search);

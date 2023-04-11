import { useQuery, useMutation } from "@tanstack/react-query";

const createUser = async (userId) => {
  const defaultData = {
    spend: 0,
    excludedFromBudget: 0,
    budget: 1000,
    customPeriod: false,
    monthResetDate: 27,
  };

  await fetch(`https://budget-tomwhittl-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`, {
    method: "PUT",
    body: JSON.stringify(defaultData),
  });
};

const fetchUserData = async (userId) => {
  const response = await fetch(
    `https://budget-tomwhittl-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`
  );
  const data = await response.json();

  if (data === null) {
    await createUser(userId);
    return await fetchUserData(userId);
  }

  return data;
};

const updateUserData = async ({ userId, data }) => {
  const response = await fetch(
    `https://budget-tomwhittl-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
  return await response.json();
};

const useBudgetData = (userId) => {
  const query = useQuery({
    queryKey: ["userData", userId],
    queryFn: () => fetchUserData(userId),
  });

  const mutation = useMutation({
    mutationFn: (data) => updateUserData(data),
  });

  return { query: { ...query }, mutation: { ...mutation } };
};

export default useBudgetData;

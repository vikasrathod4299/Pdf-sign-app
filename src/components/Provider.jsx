import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// eslint-disable-next-line react/prop-types
const UserQueryProvider = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default UserQueryProvider;

import Topbar from './Topbar';

const PageWrapper = ({ title, children }) => {
  return (
    <div className="flex-1 lg:ml-64">
      <Topbar title={title} />
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default PageWrapper;

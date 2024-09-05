import Link from 'next/link';

interface VersionStatusProps {
  onClick?: () => void;
}

const VersionStatus = ({ onClick }: VersionStatusProps) => {
  return (
    <Link href="https://github.com/hoonlight/h-seerr">
      <a
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onClick) {
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-2 flex items-center justify-center rounded-lg p-2 text-xs ring-1 ring-gray-700 transition duration-300 bg-gray-900 text-gray-300 hover:bg-gray-800"
      >
        <span className="font-bold">Powered by HoonHub</span>
      </a>
    </Link>
  );
};

export default VersionStatus;
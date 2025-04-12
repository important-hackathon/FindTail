import FooterNav from './FooterNav';
import FooterCopyright from './FooterCopyright';

export default function Footer() {
    return (
        <footer className="relative bg-[#FDF5EB] text-center text-[#432907] text-sm font-semibold">
            <FooterNav />
            <FooterCopyright />
        </footer>
    );
}

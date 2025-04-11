import Link from 'next/link';

export default function FooterNav() {
    return (
        <nav className="flex flex-wrap justify-center gap-8 p-6 text-center uppercase tracking-wide">
            <Link href="/">Головна</Link>
            <Link href="/animals">Пошук</Link>
            <Link href="/catalog">Каталог</Link>
            <Link href="/contacts">Контакти</Link>
            <Link href="/dashboard">Кабінет</Link>
        </nav>
    );
}

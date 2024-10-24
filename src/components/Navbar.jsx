
function Navbar() {
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    return (
        <div>
            <nav className="border-gray-200 bg-gray-900 ">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Rule Engine</span>
                    </a>
                    <div className="hidden w-full md:block md:w-auto" id="navbar-solid-bg">
                        <ul className="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700">
                            <li>
                                <a
                                    href="#"
                                    className="font-bold block py-2 px-3 md:p-0 text-white rounded md:bg-transparent md:dark:bg-transparent hover:text-teal-400 tracking-wide"
                                    aria-current="page"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToBottom();
                                    }}
                                >
                                    Combine
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;

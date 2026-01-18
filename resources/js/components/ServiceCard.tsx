interface ServiceCardProps {
    title: string;
    description: string;
    image: string;
    gradientFrom: string;
    gradientTo: string;
    borderColor: string;
    titleColor: string;
    descriptionColor: string;
    darkGradientFrom?: string;
    darkGradientTo?: string;
    darkBorderColor?: string;
    darkTitleColor?: string;
    darkDescriptionColor?: string;
    className?: string;
    onClick?: () => void;
}

export default function ServiceCard({
    title,
    description,
    image,
    gradientFrom,
    gradientTo,
    borderColor,
    titleColor,
    descriptionColor,
    darkGradientFrom,
    darkGradientTo,
    darkBorderColor,
    darkTitleColor,
    darkDescriptionColor,
    className = '',
    onClick,
}: ServiceCardProps) {
    return (
        <div
            onClick={onClick}
            className={`flex flex-col items-center bg-gradient-to-br ${gradientFrom} ${gradientTo} ${darkGradientFrom || ''} ${darkGradientTo || ''} shadow-lg hover:shadow-2xl p-8 border-2 ${borderColor} ${darkBorderColor || ''} rounded-2xl text-center hover:scale-105 transition-all cursor-pointer ${className}`}
        >
            <div className="flex justify-center items-center bg-white shadow-lg mb-6 rounded-full w-24 h-24">
                <img src={image} alt={title} className="w-16 h-16 object-contain" />
            </div>
            <h3 className={`mb-3 font-bold ${titleColor} ${darkTitleColor || ''} text-xl`}>{title}</h3>
            <p className={`${descriptionColor} ${darkDescriptionColor || ''} text-sm`}>{description}</p>
        </div>
    );
}

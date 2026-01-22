import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Category } from "@/data/categories";
import { ArrowRight } from "lucide-react";
import { resolveSrc } from "@/lib/functions";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group"
    >
      <Link to={`/category/${category.id}/${category.slug}`} className="block relative aspect-square overflow-hidden rounded-2xl">
        {/* Background Image */}
        <motion.img
          src={resolveSrc(category.image)}
          alt={category.name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display text-xl md:text-2xl text-card mb-1">
              {category.name}
            </h3>
            <p className="text-card/80 text-sm line-clamp-2 mb-3">
              {category.description}
            </p>
            <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
              <span>Shop Now</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-300" />
      </Link>
    </motion.div>
  );
};

export default CategoryCard;

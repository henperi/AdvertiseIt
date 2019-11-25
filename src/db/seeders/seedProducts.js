import { times } from 'lodash';
import faker from 'faker/locale/en';
import dotenv from 'dotenv';

import { log } from 'util';
import ProductRepo from '../../repositories/ProductRepo';
import ProductImageRepo from '../../repositories/ProductImageRepo';
import { randomInt } from '../../utils/randomInt';

dotenv.config();
// faker.seed(555);

const seedProducts = () =>
  new Promise(() => {
    try {
      let count = 0;
      const number = 75;
      times(number, async () => {
        count += 1;

        const userId = randomInt(1, 15);

        const title = faker.random.words(3);
        const price = faker.finance.amount();
        const description = faker.lorem.paragraph(1);

        const product = await ProductRepo.create({
          title,
          price,
          description,
          userId,
          categoryId: randomInt(1, 25),
        });

        const imageId = () => randomInt(0, 100);
        const width = randomInt(200, 400);
        const height = randomInt(200, 400);
        // https://picsum.photos/seed/picsum/200/300

        const numberOfImages = randomInt(2, 4);

        const imageArray = () =>
          [...Array(numberOfImages)].map((image, index) => ({
            image: `https://picsum.photos/id/${imageId()}/${width}/${height}`,
            isMainImage: index === 0,
            productId: product.id,
          }));

        await ProductImageRepo.createMany(imageArray());

        if (count >= number - 5) {
          return process.stdout.write(
            `${count} Products seeded successfully \n`,
          );
        }

        return null;
      });
    } catch (error) {
      log(error);
      throw error;
      // process.exit();
    }
  });

export default seedProducts;

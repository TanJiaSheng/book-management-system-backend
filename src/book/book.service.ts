import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DbService } from 'src/db/db.service';
import { Book } from './entities/book.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookService {
  @Inject()
  dbService: DbService;
  async create(createBookDto: CreateBookDto) {
    const books: Book[] = await this.dbService.read();
    const book = new Book();

    book.id = uuidv4();
    book.name = createBookDto.name;
    book.author = createBookDto.author;
    book.description = createBookDto.description;
    book.cover = createBookDto.cover;

    books.push(book);
    await this.dbService.write(books);
    return book;
  }

  async findAll(name: string) {
    const books: Book[] = await this.dbService.read();
    return name ? books.filter((book) => book.name.includes(name)) : books;
  }

  async findOne(id: string) {
    const books: Book[] = await this.dbService.read();
    return books.find((book) => book.id === id);
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    const books: Book[] = await this.dbService.read();

    const foundBook = books.find((book) => book.id === updateBookDto.id);

    if (!foundBook) {
      throw new BadRequestException('该图书不存在');
    }

    foundBook.author = updateBookDto.author;
    foundBook.cover = updateBookDto.cover;
    foundBook.description = updateBookDto.description;
    foundBook.name = updateBookDto.name;

    await this.dbService.write(books);
    return foundBook;
  }

  async remove(id: string) {
    const books: Book[] = await this.dbService.read();
    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
      books.splice(index, 1);
      await this.dbService.write(books);
    }
  }
}

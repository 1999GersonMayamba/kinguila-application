import type {
  CreateOfferRequest,
  ListOffersQuery,
  OfferResponse,
  UpdateOfferRequest,
} from '@kinguila/contracts';
import type { Offer } from '../../domain/entities/Offer';
import type { PagedResult } from '../common/PagedResult';
import { paged } from '../common/PagedResult';
import { Response } from '../common/Response';
import type { ICurrencyRepository } from '../interfaces/repositories/ICurrencyRepository';
import type { IOfferRepository } from '../interfaces/repositories/IOfferRepository';
import type { IOfferService } from '../interfaces/services/IOfferService';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Regras de negócio das ofertas. Referência viva do padrão de serviço:
 * valida regras, persiste via repositório e devolve sempre `Response<T>`.
 */
export class OfferService implements IOfferService {
  constructor(
    private readonly offers: IOfferRepository,
    private readonly currencies: ICurrencyRepository,
  ) {}

  async list(query: ListOffersQuery): Promise<Response<PagedResult<OfferResponse>>> {
    const page = Math.max(query.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.min(query.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const { items, total } = await this.offers.listActive({
      sellCurrency: query.sellCurrency,
      buyCurrency: query.buyCurrency,
      page,
      pageSize,
    });

    return Response.ok(paged(items.map(this.toResponse), total, page, pageSize));
  }

  async getById(id: string): Promise<Response<OfferResponse>> {
    const offer = await this.offers.findById(id);
    if (!offer) {
      return Response.notFound('Oferta não encontrada.');
    }
    return Response.ok(this.toResponse(offer));
  }

  async create(request: CreateOfferRequest, sellerId: string): Promise<Response<OfferResponse>> {
    const validation = await this.validatePair(request.sellCurrency, request.buyCurrency);
    if (validation) {
      return Response.fail(validation);
    }
    if (request.exchangeRate <= 0 || request.availableAmount <= 0) {
      return Response.fail('Taxa e montante disponível têm de ser maiores que zero.');
    }

    const offer = await this.offers.create({
      sellerId,
      sellCurrency: request.sellCurrency,
      buyCurrency: request.buyCurrency,
      exchangeRate: request.exchangeRate,
      availableAmount: request.availableAmount,
      status: 'active',
    });

    return Response.created(this.toResponse(offer));
  }

  async update(
    id: string,
    request: UpdateOfferRequest,
    userId: string,
  ): Promise<Response<OfferResponse>> {
    const offer = await this.offers.findById(id);
    if (!offer) {
      return Response.notFound('Oferta não encontrada.');
    }
    if (offer.sellerId !== userId) {
      return Response.forbidden('Só o vendedor pode alterar a oferta.');
    }
    if (request.exchangeRate !== undefined && request.exchangeRate <= 0) {
      return Response.fail('A taxa tem de ser maior que zero.');
    }
    if (request.availableAmount !== undefined && request.availableAmount <= 0) {
      return Response.fail('O montante disponível tem de ser maior que zero.');
    }

    const updated = await this.offers.update(id, {
      exchangeRate: request.exchangeRate,
      availableAmount: request.availableAmount,
      status: request.status,
    });
    if (!updated) {
      return Response.notFound('Oferta não encontrada.');
    }
    return Response.ok(this.toResponse(updated), 'Oferta atualizada.');
  }

  async remove(id: string, userId: string): Promise<Response<null>> {
    const offer = await this.offers.findById(id);
    if (!offer) {
      return Response.notFound('Oferta não encontrada.');
    }
    if (offer.sellerId !== userId) {
      return Response.forbidden('Só o vendedor pode remover a oferta.');
    }
    await this.offers.delete(id);
    return Response.ok(null, 'Oferta removida.');
  }

  /** Devolve uma mensagem de erro se o par de moedas for inválido, ou null se for válido. */
  private async validatePair(sell: string, buy: string): Promise<string | null> {
    if (sell === buy) {
      return 'As moedas vendida e recebida têm de ser diferentes.';
    }
    const [sellCurrency, buyCurrency] = await Promise.all([
      this.currencies.findByCode(sell as never),
      this.currencies.findByCode(buy as never),
    ]);
    if (!sellCurrency?.enabled || !buyCurrency?.enabled) {
      return 'Par de moedas não suportado.';
    }
    return null;
  }

  private toResponse(offer: Offer): OfferResponse {
    return {
      id: offer.id,
      sellerId: offer.sellerId,
      sellCurrency: offer.sellCurrency,
      buyCurrency: offer.buyCurrency,
      exchangeRate: offer.exchangeRate,
      availableAmount: offer.availableAmount,
      status: offer.status,
      createdAt: offer.createdAt.toISOString(),
      updatedAt: offer.updatedAt.toISOString(),
    };
  }
}

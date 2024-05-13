// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {console} from "forge-std/Script.sol";


//██████╗ ██╗      ██████╗  ██████╗██╗  ██╗███████╗████████╗ █████╗ ██╗   ██╗
//██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔══██╗╚██╗ ██╔╝
//██████╔╝██║     ██║   ██║██║     █████╔╝ ███████╗   ██║   ███████║ ╚████╔╝ 
//██╔══██╗██║     ██║   ██║██║     ██╔═██╗ ╚════██║   ██║   ██╔══██║  ╚██╔╝  
//██████╔╝███████╗╚██████╔╝╚██████╗██║  ██╗███████║   ██║   ██║  ██║   ██║   
//╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   
                                                                           

contract BlockStayNFT is ERC721URIStorage  {

     // endereço da carteira do hotel
    address public  ownerHotel;
    // indice da reserva
    uint16 private bookingId = 1;
    // numero de reservas totais
    uint8 private totalBooking = 0;
    // numero de reservas disponiveis
    uint8 private availableBooking = 0;
    // define o contrato
    ERC721 public tokenContract;

     // define a estrutura para os tokens
    struct Token {
        uint16  bookingId;
        uint8   roomId;
        string  descriptionBooking;
        string  descriptionRoom;
        string  dateCheckIn;
        string  dateCheckOut;
        string  tokenURI;
        bool    available;
    }

    // define a estrutura para os quartos
    struct Room {
        uint8   roomId;
        string  description;
        string  tokenURI;
    }

    // define a estrutura da reserva de hospedagem
    struct Booking {
        uint8   roomId;
        uint256 price;
        string  description;
        string  dateCheckIn;
        string  dateCheckOut;
        bool    available;
        bool    doneCheckIn;
        bool    doneCheckOut;
        bool    confirmed;
        bool    cancelled;
        string  tokenURI;
    }

    // mapeia os quartos
    mapping(uint8 => Room) public rooms;
    // mapeia as reservas
    mapping(uint16 => Booking) public bookings;
    // mapeias as reservas disponiveis por quarto
    mapping(uint8 => mapping(uint16 => Booking)) public bookingAvailables;
    // mapeia os tokens criados .. cada reserva é um token
    mapping(uint256 => Token) public bookingTokens;

    event callMakeRoom(uint16 indexed roomId);
    event callMakeBooking(uint16 indexed bookingId);
    event callMakeToken(uint16 indexed bookingId);
    event callAssignedBooking(address indexed guest, uint16 indexed bookingId);
    event callConfirmBooking(address indexed guest, uint16 indexed bookingId);
    event callCancelBooking(uint256 indexed bookingId);
    event callMakeCheckIn(uint256 indexed tokenId);
    event callMakeCheckOut(uint256 indexed tokenId);

    constructor() ERC721("BlockStayNFT", "BSTAY") {
        // Define a carteira proprietária do hotel como o criador do contrato
        ownerHotel = msg.sender;
        tokenContract = ERC721(tokenContract);
    }

    // valida se realmente é a carteira do hotel
    modifier onlyOwnerHotel() {
        require(msg.sender == ownerHotel, "Apenas o proprietario da carteira do hotel pode chamar esta funcao");
        _;
    }

    // validar se é uma carteira valida
    modifier validWallet {
        require(msg.sender != address(0), "Endereco invalido");
        require(msg.sender == tx.origin, "Somente carteira externa permitida");
        _;
    }

    // cria o quarto
    function makeRoom(uint8 _roomId, string memory _description, string memory _tokenURI) external onlyOwnerHotel validWallet {
        // cria o novo quarto
        rooms[_roomId] = Room(_roomId, _description, _tokenURI);
        // faz emissão do quarto
        emit callMakeRoom(_roomId);
    }

    // cria a reserva 
    function makeBooking(
        uint8 _roomId,
        uint256 _price,
        string memory _description,
        string memory _dateCheckIn,
        string memory _dateCheckOut,
        string memory _metadata
    ) external onlyOwnerHotel validWallet {
        require(rooms[_roomId].roomId == _roomId, "Quarto nao encontrado");
        // armazena o indice atual da reserva
        uint16 thisBookingId = bookingId;
        // cria a nova reserva
        bookings[thisBookingId] = Booking(_roomId, _price, _description, _dateCheckIn, _dateCheckOut, false, false, false, false, false, _metadata);
        // torna o quarto disponivel
        makeBookingAvailable(_roomId, thisBookingId);
        // cria o token da reserva do quarto
        makeBookingToken(_roomId, thisBookingId);
        // faz emissão da reserva
        emit callMakeBooking(thisBookingId);
    }

    // atribui a reserva para o cliente
    function assignedBooking(uint16 _bookingId) external validWallet {
        // valida se a reserva esta disponivel
        require(bookings[_bookingId].available, "Reserva nao disponivel");
        // remove disponibilidade da reserva
        makeBookingNonAvailable(_bookingId);
        // faz emissão da reserva do cliente
        emit callAssignedBooking(msg.sender, _bookingId);
    }
    
    // faz pagamento da reserva
    function payBooking(uint16 _bookingId) external payable validWallet {
        // encontra o valor
        uint256 priceBooking = bookings[_bookingId].price;
        require(msg.value >= priceBooking, "Valor insuficiente enviado");
        // faz o pagamento
        // Tente realizar a transferência
        (bool transferSuccess, ) = payable(ownerHotel).call{value: msg.value}("");
        // Verifique se a transferência foi bem-sucedida
        require(transferSuccess, "A transferencia falhou");
        // confirma a reserva
        confirmBooking(_bookingId);
    }

    // quando precisa apenas confirmar, já foi pago de outra forma
    function onlyConfirmBooking(uint16 _bookingId) external validWallet {
        // confirma a reserva
        confirmBooking(_bookingId);
    }

    // confirma a reserva
    function confirmBooking(uint16 _bookingId) internal {
        // transfere o token ao cliente
        tokenContract.transferFrom(ownerHotel, msg.sender, _bookingId);
        // torna a reserva confirmada
        bookings[_bookingId].confirmed = true;
        // faz emissão de confirmação
        emit callConfirmBooking(msg.sender, _bookingId);
    }

    // para cancelar, o cliente precisa solicitar ao hotel, e eles farão o cancelamento
    function cancelBooking(uint16 _bookingId) external onlyOwnerHotel validWallet {
        // valida se é possivel cancelar
        require(!bookings[_bookingId].doneCheckIn, "Nao e possivel cancelar reserva apos check-in");
        // valida se já estava confirmada
        if (bookings[_bookingId].confirmed) {
            // transfere o token de volta ao hotel
            tokenContract.transferFrom(msg.sender, ownerHotel, _bookingId);
            // o valor deve ser estornado de outras maneiras .. num futuro poderá ser implementado aqui
        }
        // torna disponivel novamente a reserva
        makeBookingAvailable(bookings[_bookingId].roomId, _bookingId);
        // faz emissao do cancelamento
        emit callCancelBooking(_bookingId);
    }

    function makeCheckIn(uint16 _bookingId) external validWallet {
        // valida se a reserva está confirmada para fazer o checkin
        require(bookings[_bookingId].confirmed, "Reserva nao confirmada");
        require(!bookings[_bookingId].doneCheckIn, "Reserva ja confirmada");
        // valida pela data se pode fazer o checkin .. necessario a data vir em formato de numeros
        // require(bookings[_bookingId].dateCheckIn <= block.timestamp, "Check-in disponivel apenas apos a data de check-in");
        // valida se o cliente possui o NFT associado a reserva
        require(tokenContract.ownerOf(_bookingId) == msg.sender, "Voce nao possui o NFT associado a reserva");
        // atribui o check ok
        bookings[_bookingId].doneCheckIn = true;
        // faz a emissão do checkin
        emit callMakeCheckIn(_bookingId);
    }

    function makeCheckOut(uint16 _bookingId) external validWallet {
        // valida se pode fazer o checkout
        require(bookings[_bookingId].doneCheckIn, "Check-in ainda nao realizado");
        require(!bookings[_bookingId].doneCheckOut, "Check-out ja realizado");
        // valida se o cliente possui o NFT associado a reserva
        require(tokenContract.ownerOf(_bookingId) == msg.sender, "Voce nao possui o NFT associado a reserva");
        // atribui o checkout
        bookings[_bookingId].doneCheckOut = true;
        // faz emissão do checkout
        emit callMakeCheckOut(_bookingId);
    }

    // torna o reserva disponivel
    function makeBookingAvailable(uint8 _roomId, uint16 _bookingId) private {
        // torna a reserva disponivel
        bookings[_bookingId].available = true;
        bookingTokens[_bookingId].available = true;
        // caso ainda não esteja mapeado como disponivel
        if (!bookingAvailables[_roomId][_bookingId].available) {
            // cria o mapa de resrvas e quartos disponiveis
            bookingAvailables[_roomId][_bookingId] = bookings[_bookingId];
        }
        // incrementa o indice da reserva se for a atual
        if (bookingId == _bookingId) {
            bookingId++;
        }
        // incrementa o total de disponibilidade
      //  if (bookingId <= totalBooking) {
            totalBooking++;
            availableBooking++;
      //  }
    }

  // faz o token da reserva
    function makeBookingToken(uint8 _roomId, uint16 _bookingId) private {
        // cria o token para acesso interno
        bookingTokens[_bookingId] = Token(
           _bookingId,
           _roomId,
           rooms[_roomId].description,
           bookings[_bookingId].description,
           bookings[_bookingId].dateCheckIn,
           bookings[_bookingId].dateCheckOut,
           bookings[_bookingId].tokenURI,
           bookings[_bookingId].available
        );

        // cria data como byte para monta os atributos do token
        bytes memory data;
        data = abi.encodePacked(
            "bookingId",          bookingTokens[_bookingId].bookingId,
            "roomId",             bookingTokens[_bookingId].roomId,
            "descriptionBooking", bookingTokens[_bookingId].descriptionBooking,
            "descriptionRoom",    bookingTokens[_bookingId].descriptionRoom,
            "dateCheckIn",        bookingTokens[_bookingId].dateCheckIn,
            "dateCheckOut",       bookingTokens[_bookingId].dateCheckOut,
            "tokenURI",           bookingTokens[_bookingId].tokenURI,
            "available",          bookingTokens[_bookingId].available
        );

        // cria o token único NFT
        _safeMint(ownerHotel, _bookingId, data);
        _setTokenURI(_bookingId, bookingTokens[_bookingId].tokenURI);
        // emite token
        emit callMakeToken(_bookingId);
    }

    // torna o reserva indisponivel
    function makeBookingNonAvailable(uint16 _bookingId) private {
        // recupera numero do quarto
        uint8 thisRoomId = bookings[_bookingId].roomId;
        // remove o quarto do mapa de reservas
        delete bookingAvailables[thisRoomId][_bookingId];
        // incrementa o indice da reserva caso tenha mais e total
        if (availableBooking > 0) {
            availableBooking--;
        }
        // torna a reserva indisponivel;
        bookings[_bookingId].available = false;
        bookingTokens[_bookingId].available = false;
    }


    // Retorna uma lista de todos os tokens criados
    function getAllTokens() external view returns (Token[] memory) {
        Token[] memory allTokens = new Token[](totalBooking);
        for (uint16 i = 1; i <= totalBooking; i++) {
            allTokens[i] = bookingTokens[i];             
        }
        return allTokens;
    }
    

    //incluir withdrau()
}
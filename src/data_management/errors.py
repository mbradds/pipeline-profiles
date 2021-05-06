class ApportionSeriesCombinationError(Exception):
    """Exception raised when the combination of apportionment data sets is unexpected. 
    There should only be two configurations: Enbridge and other

    Attributes:
        company -- input company which caused the error
    """

    def __init__(self, company, message="Unpredictable data combination for: "):
        self.company = company
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f'{self.message} {self.company}'